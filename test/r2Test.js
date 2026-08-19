const r2Client = require('../lib/r2');

const { ListObjectsV2Command } = require('@aws-sdk/client-s3');

require('dotenv').config();

async function testR2(){
    try{
        const command = new ListObjectsV2Command({
            Bucket: process.env.R2_BUCKET_NAME
        });

        const response = await r2Client.send(command);

        console.log('R2 connection successfull');
        console.log('Objects: ', response.Contents ?? []);
    }catch(err){
        console.error("R2 connection failed");
        console.error(err);
    }
}

testR2();