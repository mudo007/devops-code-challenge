import * as gcp from '@pulumi/gcp';
import * as pulumi from '@pulumi/pulumi';

//golbal setups for google cloud
const gcpConfig = new pulumi.Config('gcp');
const gcpClusterConfig = new pulumi.Config('gcp-cluster');
pulumi.runtime.setConfig('gcp:project', gcpConfig.require('project'));
pulumi.runtime.setConfig('gcp:region', gcpConfig.require('region'));

export function gcpCreateCluster(
  name: string
): pulumi.Output<gcp.container.Cluster> {
  const gcpCluster = new gcp.container.Cluster(name, {
    initialNodeCount: Number(gcpClusterConfig.require('initialNodeCount')),
    location: gcpConfig.require('region'),
    minMasterVersion: gcpClusterConfig.require('minMasterVersion'),
    nodeConfig: {
      machineType: gcpClusterConfig.require('machineType'),
    },
  });
  return pulumi.output(gcpCluster);
}
