package api

import (
	"context"
	"net/http"
	"sync"

	"github.com/ferama/vipien/pkg/protocol"
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
	type nsItem struct {
		Name string `json:"name"`
	}
	type response struct {
		Namespaces []nsItem `json:"namespaces"`
	}
	res := &response{
		Namespaces: make([]nsItem, 0),
	}
	for _, item := range namespaces.Items {
		res.Namespaces = append(res.Namespaces, nsItem{Name: item.Name})
	}
	c.JSON(http.StatusOK, res)
}

func (k *k8sRoutes) getServices(c *gin.Context) {
	namespace := c.Param("namespace")
	services, err := k.clientset.CoreV1().Services(namespace).List(context.TODO(), metav1.ListOptions{})
	if err != nil {
		c.JSON(http.StatusBadGateway, nil)
	}
	type port struct {
		Protcol string `json:"protocol"`
		Port    int32  `json:"port"`
		IsHttp  bool   `json:"isHttp"`
	}
	type service struct {
		Name  string `json:"name"`
		Ports []port `json:"ports"`
	}
	type response struct {
		Services []service `json:"services"`
	}
	res := &response{
		Services: make([]service, 0),
	}

	var wg sync.WaitGroup
	var mu sync.Mutex

	for _, item := range services.Items {
		wg.Add(1)
		go func(item v1.Service) {
			ports := make([]port, 0)
			for _, p := range item.Spec.Ports {

				isHttp := false
				if p.Protocol == "TCP" {
					isHttp = protocol.IsHttp(item.Name, p.Port, namespace)
				}
				ports = append(ports, port{
					Protcol: string(p.Protocol),
					Port:    p.Port,
					IsHttp:  isHttp,
				})
			}
			s := service{
				Name:  item.Name,
				Ports: ports,
			}
			mu.Lock()
			res.Services = append(res.Services, s)
			mu.Unlock()

			wg.Done()
		}(item)
	}
	wg.Wait()
	c.JSON(http.StatusOK, res)
}
