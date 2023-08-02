export type AmplifyDependentResourcesAttributes = {
    "storage": {
        "cpl": {
            "Name": "string",
            "Arn": "string",
            "StreamArn": "string",
            "PartitionKeyName": "string",
            "PartitionKeyType": "string",
            "Region": "string"
        }
    },
    "function": {
        "mylambdax": {
            "Name": "string",
            "Arn": "string",
            "Region": "string",
            "LambdaExecutionRole": "string"
        },
        "paypalHandler": {
            "Name": "string",
            "Arn": "string",
            "Region": "string",
            "LambdaExecutionRole": "string"
        }
    },
    "api": {
        "serverv2": {
            "RootUrl": "string",
            "ApiName": "string",
            "ApiId": "string"
        }
    }
}