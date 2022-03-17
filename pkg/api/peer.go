package api

import (
	"fmt"
	"io/fs"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"strings"

	"github.com/gin-gonic/gin"
)

func find(root, ext string) []string {
	var a []string
	filepath.WalkDir(root, func(s string, d fs.DirEntry, e error) error {
		if e != nil {
			return e
		}
		if filepath.Ext(d.Name()) == ext {
			a = append(a, s)
		}
		return nil
	})
	return a
}

type peerRoutes struct {
	configRoot string
}

// RootRoutes setup the root api routes
func PeerRoutes(configRoot string, router *gin.RouterGroup) {
	p := &peerRoutes{
		configRoot: configRoot,
	}

	router.GET("", p.list)
	router.GET(":name", p.get)
	router.DELETE(":name", p.delete)
	router.POST("", p.add)
}

func (p *peerRoutes) get(c *gin.Context) {
	peerName := c.Param("name")

	type response struct {
		Data string `json:"data"`
	}
	confPath := filepath.Join(p.configRoot, "peers", fmt.Sprintf("%s.conf", peerName))
	log.Println(confPath)
	file, _ := os.Open(confPath)
	defer file.Close()
	b, _ := ioutil.ReadAll(file)

	res := &response{
		Data: string(b),
	}
	c.JSON(http.StatusOK, res)
}

func (p *peerRoutes) list(c *gin.Context) {
	type response struct {
		Peers []string `json:"peers"`
	}
	res := &response{
		Peers: make([]string, 0),
	}
	for _, s := range find(filepath.Join(p.configRoot, "peers"), ".conf") {
		name := filepath.Base(s)
		name = strings.TrimSuffix(name, filepath.Ext(name))
		res.Peers = append(res.Peers, name)
	}
	c.JSON(http.StatusOK, res)
}

func (p *peerRoutes) delete(c *gin.Context) {
	peerName := c.Param("name")

	// prevent deletion of the root peer
	if peerName == "1" {
		c.JSON(http.StatusOK, "")
		return
	}

	out, err := exec.Command("remove-peer", peerName).Output()
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}
	type response struct {
		Message string `json:"message"`
	}
	res := &response{
		Message: string(out),
	}
	c.JSON(http.StatusOK, res)
}

// Example curl:
// curl -X POST -H "Content-Type: application/json" --data '{"name": "peer1"}' http://localhost:8080/api/peers
func (p *peerRoutes) add(c *gin.Context) {
	type model struct {
		Name string `json:"name"`
	}
	data := &model{}
	if err := c.BindJSON(data); err != nil {
		log.Println(err)
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}
	out, err := exec.Command("add-peer", data.Name).Output()
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}
	type response struct {
		Message string `json:"message"`
	}
	res := &response{
		Message: string(out),
	}
	c.JSON(http.StatusOK, res)
}
