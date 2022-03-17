package protocol

import "testing"

func TestIsHttp(t *testing.T) {
	if !IsHttp("google", 80, "it") {
		t.Fail()
	}
}
