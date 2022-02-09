package main

import (
	"github.com/ferama/vipien/pkg/api"
	"github.com/gin-gonic/gin"
)

const (
	configRoot = "/config"
	// configRoot = "."
)

func main() {
	// gin.SetMode(gin.ReleaseMode)
	r := gin.Default()

	api.RootRoutes(r.Group("/api"))
	api.PeerRoutes(configRoot, r.Group("/api/peers"))
	r.Run()
}
