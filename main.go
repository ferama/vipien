package main

import (
	"flag"
	"io/fs"
	"net/http"
	"path/filepath"
	"time"

	"github.com/ferama/vipien/pkg/api"
	"github.com/ferama/vipien/pkg/ui"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/rest"
	"k8s.io/client-go/tools/clientcmd"
	"k8s.io/client-go/util/homedir"
)

const (
	configRoot = "/config"
	// configRoot = "."
)

func getRestConfig() *rest.Config {
	config, err := rest.InClusterConfig()
	if err == nil {
		return config
	}
	var kubeconfig *string
	if home := homedir.HomeDir(); home != "" {
		kubeconfig = flag.String("kubeconfig", filepath.Join(home, ".kube", "config"), "(optional) absolute path to the kubeconfig file")
	} else {
		kubeconfig = flag.String("kubeconfig", "", "absolute path to the kubeconfig file")
	}
	flag.Parse()
	// use the current context in kubeconfig
	config, err = clientcmd.BuildConfigFromFlags("", *kubeconfig)
	if err == nil {
		return config
	}
	panic(err.Error())
}

func main() {
	config := getRestConfig()

	// create the clientset
	clientset, err := kubernetes.NewForConfig(config)
	if err != nil {
		panic(err.Error())
	}

	r := gin.Default()
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"*"},
		AllowHeaders:     []string{"Content-Type, Origin"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	api.RootRoutes(r.Group("/api"))
	api.PeerRoutes(configRoot, r.Group("/api/peers"))
	api.K8sRoutes(clientset, r.Group("/api/k8s"))

	// static files custom middleware
	// use the "build" dir (the webpack target) as static root
	fsRoot, _ := fs.Sub(ui.StaticFiles, "build")
	fileserver := http.FileServer(http.FS(fsRoot))
	r.Use(func(c *gin.Context) {
		fileserver.ServeHTTP(c.Writer, c.Request)
		c.Abort()
	})

	r.Run()
}
