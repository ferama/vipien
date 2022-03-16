package protocol

import (
	"fmt"
	"net/http"
	"time"
)

func IsHttp(svc string, port int32, namespace string) bool {
	url := fmt.Sprintf("http://%s.%s:%d", svc, namespace, port)

	client := http.Client{
		Timeout: 1000 * time.Millisecond,
	}
	_, err := client.Get(url)

	return err == nil
}
