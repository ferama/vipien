package api

import (
	"context"
	"net/http"

	"github.com/gin-gonic/gin"
	v1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes"
)

type k8sRoutes struct {
	clientset *kubernetes.Clientset
}

func K8sRoutes(k8sclient *kubernetes.Clientset, router *gin.RouterGroup) {
	k := &k8sRoutes{
		clientset: k8sclient,
	}

	router.GET("ns", k.getNamespaces)
	router.GET("ns/:namespace/svc", k.getServices)
}

func (k *k8sRoutes) getNamespaces(c *gin.Context) {
	namespaces, err := k.clientset.CoreV1().Namespaces().List(context.TODO(), metav1.ListOptions{})
	if err != nil {
		c.JSON(http.StatusBadGateway, nil)
	}
	type response struct {
		Namespaces []string `json:"namespaces"`
	}
	res := &response{
		Namespaces: make([]string, 0),
	}
	for _, item := range namespaces.Items {
		res.Namespaces = append(res.Namespaces, item.Name)
	}
	c.JSON(http.StatusOK, res)
}

func (k *k8sRoutes) getServices(c *gin.Context) {
	namespace := c.Param("namespace")
	services, err := k.clientset.CoreV1().Services(namespace).List(context.TODO(), metav1.ListOptions{})
	if err != nil {
		c.JSON(http.StatusBadGateway, nil)
	}
	type service struct {
		Name  string           `json:"services"`
		Ports []v1.ServicePort `json:"ports"`
	}
	type response struct {
		Services []service `json:"services"`
	}
	res := &response{
		Services: make([]service, 0),
	}

	for _, item := range services.Items {
		s := service{
			Name:  item.Name,
			Ports: item.Spec.Ports,
		}
		res.Services = append(res.Services, s)
	}
	c.JSON(http.StatusOK, res)
}
