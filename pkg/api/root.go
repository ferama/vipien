package api

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

type rootRoutes struct{}

// RootRoutes setup the root api routes
func RootRoutes(router *gin.RouterGroup) {
	r := &rootRoutes{}

	router.GET("", r.getRoot)
}

func (r *rootRoutes) getRoot(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{})
}
