# Diagram Around Chobiit VPC

I created this diagram by draw.io . Please check the attached file!!!

![image][chobiit-prod-network-strucure.drawio.png]

# VPC Settings of Chobiit Lambda Functions

- All lambda functions which are set VPC are set in [lambda_prv](https://us-west-1.console.aws.amazon.com/vpc/home?region=us-west-1#SubnetDetails:subnetId=subnet-087c6dd556ae6a180) subnet

```
chobiitAddComment              {"SubnetIds":["subnet-087c6dd556ae6a180"],"SecurityGroupIds":["sg-040f09f76acbaf448"],"VpcId":"vpc-05e7f4c48fba8ea44"}
chobiitAddRecord               {"SubnetIds":["subnet-087c6dd556ae6a180"],"SecurityGroupIds":["sg-040f09f76acbaf448"],"VpcId":"vpc-05e7f4c48fba8ea44"}
chobiitAutoDeleteFile          null
chobiitCheckExistSlot          null
chobiitConfigDynamo            {"SubnetIds":["subnet-087c6dd556ae6a180"],"SecurityGroupIds":["sg-040f09f76acbaf448"],"VpcId":"vpc-05e7f4c48fba8ea44"}
chobiitCreateDistribution      {"SubnetIds":["subnet-087c6dd556ae6a180"],"SecurityGroupIds":["sg-040f09f76acbaf448"],"VpcId":"vpc-05e7f4c48fba8ea44"}
chobiitCreateForm              {"SubnetIds":["subnet-087c6dd556ae6a180"],"SecurityGroupIds":["sg-040f09f76acbaf448"],"VpcId":"vpc-05e7f4c48fba8ea44"}
chobiitCreateUser              {"SubnetIds":["subnet-087c6dd556ae6a180"],"SecurityGroupIds":["sg-040f09f76acbaf448"],"VpcId":"vpc-05e7f4c48fba8ea44"}
chobiitCustomCognitoMessage    null
chobiitDeleteApp               {"SubnetIds":["subnet-087c6dd556ae6a180"],"SecurityGroupIds":["sg-040f09f76acbaf448"],"VpcId":"vpc-05e7f4c48fba8ea44"}
chobiitDeleteComment           {"SubnetIds":["subnet-087c6dd556ae6a180"],"SecurityGroupIds":["sg-040f09f76acbaf448"],"VpcId":"vpc-05e7f4c48fba8ea44"}
chobiitDeleteKintoneUser       {"SubnetIds":["subnet-087c6dd556ae6a180"],"SecurityGroupIds":["sg-040f09f76acbaf448"],"VpcId":"vpc-05e7f4c48fba8ea44"}
chobiitDeleteRecord            {"SubnetIds":["subnet-087c6dd556ae6a180"],"SecurityGroupIds":["sg-040f09f76acbaf448"],"VpcId":"vpc-05e7f4c48fba8ea44"}
chobiitDeleteUser              {"SubnetIds":["subnet-087c6dd556ae6a180"],"SecurityGroupIds":["sg-040f09f76acbaf448"],"VpcId":"vpc-05e7f4c48fba8ea44"}
chobiitDowloadFileStep         {"SubnetIds":["subnet-087c6dd556ae6a180"],"SecurityGroupIds":["sg-040f09f76acbaf448"],"VpcId":"vpc-05e7f4c48fba8ea44"}
chobiitDownloadFile            {"SubnetIds":["subnet-087c6dd556ae6a180"],"SecurityGroupIds":["sg-040f09f76acbaf448"],"VpcId":"vpc-05e7f4c48fba8ea44"}
chobiitEditRecord              {"SubnetIds":["subnet-087c6dd556ae6a180"],"SecurityGroupIds":["sg-040f09f76acbaf448"],"VpcId":"vpc-05e7f4c48fba8ea44"}
chobiitGetAppRights            {"SubnetIds":["subnet-087c6dd556ae6a180"],"SecurityGroupIds":["sg-040f09f76acbaf448"],"VpcId":"vpc-05e7f4c48fba8ea44"}
chobiitGetAppSetting           {"SubnetIds":["subnet-087c6dd556ae6a180"],"SecurityGroupIds":["sg-040f09f76acbaf448"],"VpcId":"vpc-05e7f4c48fba8ea44"}
chobiitGetComment              {"SubnetIds":["subnet-087c6dd556ae6a180"],"SecurityGroupIds":["sg-040f09f76acbaf448"],"VpcId":"vpc-05e7f4c48fba8ea44"}
chobiitGetConfig               {"SubnetIds":["subnet-087c6dd556ae6a180"],"SecurityGroupIds":["sg-040f09f76acbaf448"],"VpcId":"vpc-05e7f4c48fba8ea44"}
chobiitGetDistributionState    {"SubnetIds":["subnet-087c6dd556ae6a180"],"SecurityGroupIds":["sg-040f09f76acbaf448"],"VpcId":"vpc-05e7f4c48fba8ea44"}
chobiitGetLookupRecords        {"SubnetIds":["subnet-087c6dd556ae6a180"],"SecurityGroupIds":["sg-040f09f76acbaf448"],"VpcId":"vpc-05e7f4c48fba8ea44"}
chobiitGetRecord               {"SubnetIds":["subnet-087c6dd556ae6a180"],"SecurityGroupIds":["sg-040f09f76acbaf448"],"VpcId":"vpc-05e7f4c48fba8ea44"}
chobiitGetShowText             {"SubnetIds":["subnet-087c6dd556ae6a180"],"SecurityGroupIds":["sg-040f09f76acbaf448"],"VpcId":"vpc-05e7f4c48fba8ea44"}
chobiitGetUserInfo             {"SubnetIds":["subnet-087c6dd556ae6a180"],"SecurityGroupIds":["sg-040f09f76acbaf448"],"VpcId":"vpc-05e7f4c48fba8ea44"}
chobiitInvalidating            null
chobiitListApp                 {"SubnetIds":["subnet-087c6dd556ae6a180"],"SecurityGroupIds":["sg-040f09f76acbaf448"],"VpcId":"vpc-05e7f4c48fba8ea44"}
chobiitListRecords             {"SubnetIds":["subnet-087c6dd556ae6a180"],"SecurityGroupIds":["sg-040f09f76acbaf448"],"VpcId":"vpc-05e7f4c48fba8ea44"}
chobiitManageApp               {"SubnetIds":["subnet-087c6dd556ae6a180"],"SecurityGroupIds":["sg-040f09f76acbaf448"],"VpcId":"vpc-05e7f4c48fba8ea44"}
chobiitPostUserInfo            {"SubnetIds":["subnet-087c6dd556ae6a180"],"SecurityGroupIds":["sg-040f09f76acbaf448"],"VpcId":"vpc-05e7f4c48fba8ea44"}
chobiitPublicAddRecord         {"SubnetIds":["subnet-087c6dd556ae6a180"],"SecurityGroupIds":["sg-040f09f76acbaf448"],"VpcId":"vpc-05e7f4c48fba8ea44"}
chobiitPublicDownloadFile      {"SubnetIds":["subnet-087c6dd556ae6a180"],"SecurityGroupIds":["sg-040f09f76acbaf448"],"VpcId":"vpc-05e7f4c48fba8ea44"}
chobiitPublicDownloadFileStep  {"SubnetIds":["subnet-087c6dd556ae6a180"],"SecurityGroupIds":["sg-040f09f76acbaf448"],"VpcId":"vpc-05e7f4c48fba8ea44"}
chobiitPublicGetLookupRecords  {"SubnetIds":["subnet-087c6dd556ae6a180"],"SecurityGroupIds":["sg-040f09f76acbaf448"],"VpcId":"vpc-05e7f4c48fba8ea44"}
chobiitPublicGetRecord         {"SubnetIds":["subnet-087c6dd556ae6a180"],"SecurityGroupIds":["sg-040f09f76acbaf448"],"VpcId":"vpc-05e7f4c48fba8ea44"}
chobiitPublicListRecords       {"SubnetIds":["subnet-087c6dd556ae6a180"],"SecurityGroupIds":["sg-040f09f76acbaf448"],"VpcId":"vpc-05e7f4c48fba8ea44"}
chobiitPublicUploadFile        {"SubnetIds":["subnet-087c6dd556ae6a180"],"SecurityGroupIds":["sg-040f09f76acbaf448"],"VpcId":"vpc-05e7f4c48fba8ea44"}
chobiitPublicUploadFileStep    {"SubnetIds":["subnet-087c6dd556ae6a180"],"SecurityGroupIds":["sg-040f09f76acbaf448"],"VpcId":"vpc-05e7f4c48fba8ea44"}
chobiitPutCount                {"SubnetIds":["subnet-087c6dd556ae6a180"],"SecurityGroupIds":["sg-040f09f76acbaf448"],"VpcId":"vpc-05e7f4c48fba8ea44"}
chobiitResendConfirmationCode  null
chobiitResetCount              {"SubnetIds":["subnet-087c6dd556ae6a180"],"SecurityGroupIds":["sg-040f09f76acbaf448"],"VpcId":"vpc-05e7f4c48fba8ea44"}
chobiitResetPassword           null
chobiitSendMail                null
chobiitSyncData                {"SubnetIds":["subnet-087c6dd556ae6a180"],"SecurityGroupIds":["sg-040f09f76acbaf448"],"VpcId":"vpc-05e7f4c48fba8ea44"}
chobiitUploadCustomFile        null
chobiitUploadFile              {"SubnetIds":["subnet-087c6dd556ae6a180"],"SecurityGroupIds":["sg-040f09f76acbaf448"],"VpcId":"vpc-05e7f4c48fba8ea44"}
chobiitUploadFileStep          {"SubnetIds":["subnet-087c6dd556ae6a180"],"SecurityGroupIds":["sg-040f09f76acbaf448"],"VpcId":"vpc-05e7f4c48fba8ea44"}
chobiitUserPut                 {"SubnetIds":["subnet-087c6dd556ae6a180"],"SecurityGroupIds":["sg-040f09f76acbaf448"],"VpcId":"vpc-05e7f4c48fba8ea44"}
chobiitUserRegister            {"SubnetIds":["subnet-087c6dd556ae6a180"],"SecurityGroupIds":["sg-040f09f76acbaf448"],"VpcId":"vpc-05e7f4c48fba8ea44"}
chobititGetRelateRecords       {"SubnetIds":["subnet-087c6dd556ae6a180"],"SecurityGroupIds":["sg-040f09f76acbaf448"],"VpcId":"vpc-05e7f4c48fba8ea44"}
chobitoneUpdateUser            {"SubnetIds":["subnet-087c6dd556ae6a180"],"SecurityGroupIds":["sg-040f09f76acbaf448"],"VpcId":"vpc-05e7f4c48fba8ea44"}
```