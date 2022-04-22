#! bin/bash

aws iot create-job --job-id "UpdateConfiguration" --targets "arn:aws:iot:us-east-1:350519313439:thing/dca632ef8148" --document "$(cat updateConfigurations.json)"