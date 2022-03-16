package protocol

func IsHttp(svc string, port int32, namespace string) bool {
	return false

	// uri := fmt.Sprintf("%s:%d", svc, port)
	// conn, err := net.Dial("tcp", uri)
	// if err != nil {
	// 	return false
	// }

	// conn.Write([]byte("GET .\n"))

	// buf := make([]byte, 4)

	// conn.SetReadDeadline(time.Now().Add(time.Second))
	// _, err = conn.Read(buf)
	// if err != nil {
	// 	return false
	// }
	// res := string(buf)
	// return strings.ToUpper(res) == "HTTP"
}
