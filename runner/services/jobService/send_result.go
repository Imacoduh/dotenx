package jobService

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/utopiops/automated-ops/runner/config"
	"github.com/utopiops/automated-ops/runner/models"
)

func (manager *JobManager) SendResult(jobId string, status models.TaskStatus) error {
	url := fmt.Sprintf("%s/queue/%s/job/%s/result", config.Configs.Endpoints.JobScheduler, config.Configs.Queue.Name, jobId)
	json_data, err := json.Marshal(status)
	if err != nil {
		return err
	}
	body := bytes.NewBuffer(json_data)
	_, err, _ = manager.HttpHelper.HttpRequest(http.MethodPost, url, body, nil, time.Minute)
	if err != nil {
		return err
	}
	return nil
}
