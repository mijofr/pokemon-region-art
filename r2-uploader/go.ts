import { R2 } from 'node-cloudflare-r2';
import * as fs from 'fs';
// cloudflare api token value: Rj1JG3aZ6_A-5HUHeZALXzwWsrErht8xbBDfI4gl
// jurisdiction endpoint: https://b5c037f017d43b6779b432cdf80f8fa0.r2.cloudflarestorage.com
import { MetricsResponse } from './types';


// remember to swap these out and put the new ones in secret storage before public'ing repo

const configTokens = {
    accountId: 'b5c037f017d43b6779b432cdf80f8fa0',
    accessKeyId: '2cef0b99024920aea528136a0163de5f',
    secretAccessKey: '012a8199f5b75fddcf0e267e179214247552a97eb1f0cff8e9f5de8b83eb904b',
    cfApiToken: 'Rj1JG3aZ6_A-5HUHeZALXzwWsrErht8xbBDfI4gl',
    cfJurisEndpoint: 'https://b5c037f017d43b6779b432cdf80f8fa0.r2.cloudflarestorage.com'
}

interface OpsCount {
    ClassA: number;
    ClassB: number;
    Unknown: number;
}



// limited one
const cfAnalyticsApiToken = 'wilXfwd62LV3oNTK1FsTPa7XdTmI6qwTTh4TtzIE';

function assimilateMetricsResponse(dataset: MetricsResponse): OpsCount {

    const classA = ['listbuckets', 'putbucket', 'listobjects', 'putobject', 'copyobject', 'completemultipartupload', 'createmultipartupload', 'listmultipartuploads', 'uploadpart', 'uploadpartcopy', 'listparts', 'putbucketencryption', 'putbucketcors', 'putbucketlifecycleconfiguration'];
    const classB = ['headbucket', 'headobject', 'getobject', 'usagesummary', 'getbucketencryption', 'getbucketlocation', 'getbucketcors', 'getbucketlifecycleconfiguration'];    
    const classFree = ['deleteobject', 'deletebucket', 'abortmultipartupload']

    try {

        let classACount: number = 0;
        let classBCount: number = 0;
        let unknownCount: number = 0;

        dataset.data.viewer.accounts.forEach(acc => {
            acc.r2OperationsAdaptiveGroups.forEach(grp => {
                if (classB.includes(grp.dimensions.actionType.toLocaleLowerCase())) {
                    classBCount = classBCount + grp.sum.requests;
                } else if (classA.includes(grp.dimensions.actionType.toLocaleLowerCase())) {
                    classACount = classACount + grp.sum.requests;
                } else if (classFree.includes(grp.dimensions.actionType.toLocaleLowerCase())) {

                } else {
                    console.warn('unrecognised operation: ' + grp.dimensions.actionType)
                    unknownCount = unknownCount + grp.sum.requests;
                }
            })
        });
        return {
            ClassA: classACount,
            ClassB: classBCount,
            Unknown: unknownCount
        }

    } catch (e) {
        console.error("Exception while assimilating return data")
        console.error(e);
        throw e
    }


    
}

async function check1() {

    // Initialize R2
    const r2 = new R2({
        accountId: configTokens.accountId,
        accessKeyId: configTokens.accessKeyId,
        secretAccessKey: configTokens.secretAccessKey,
    });

    // Initialize bucket instance
    const bucket = r2.bucket('region-art');

    // [Optional] Provide the public URL(s) of your bucket, if its public access is allowed.
    // bucket.provideBucketPublicUrl('https://pub-xxxxxxxxxxxxxxxxxxxxxxxxx.r2.dev');

    // Check if the bucket exists
    console.log(await bucket.exists()); // true


    bucket.listObjects


}


async function checkMetrics(): Promise<OpsCount> {

    const dateFromMonthStart = new Date()
    dateFromMonthStart.setDate(1);

    const res = await fetch('https://api.cloudflare.com/client/v4/graphql', {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + cfAnalyticsApiToken,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            query: `{
            viewer {
              accounts(filter: { accountTag: "${configTokens.accountId}" }) {
                r2OperationsAdaptiveGroups(
                  filter: { datetime_geq: "${dateFromMonthStart.toISOString()}" }
                  limit: 9999
                ) {
                  dimensions {
                    actionType
                    storageClass
                  }
                  sum {
                    requests
                  }
                }
              }
            }
          }`
        })
    });

    const body = await res.json();

    try {

        let OpsCount = assimilateMetricsResponse(body as MetricsResponse)
        return OpsCount;
    } catch(e) {
        console.error("Error assimilating response data");
        console.log(res);
        throw e;
    }

}

async function go(): Promise<boolean> {
    let opCount = await checkMetrics();


    console.log("Operations Count: " + JSON.stringify(opCount));

    if (((opCount.ClassA + opCount.Unknown) / 1000000) > 0.8) {
        console.warn("Approaching metric limits for class A operations: " + JSON.stringify(opCount));
        return false;
    }
    if (((opCount.ClassB + opCount.Unknown) / 10000000) > 0.8) {
        console.warn("Approaching metric limits for class B operations: " + JSON.stringify(opCount));
        return false;
    }

    return true;
}


go();
