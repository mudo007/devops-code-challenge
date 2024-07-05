import * as gcp from '@pulumi/gcp';
import * as pulumi from '@pulumi/pulumi';

export function gcpCreateCluster(
  name: string
): pulumi.Output<gcp.container.Cluster> {
  const gcpClusterConfig = new pulumi.Config('gcp-cluster');
  const gcpCluster = new gcp.container.Cluster(name, {
    initialNodeCount: Number(gcpClusterConfig.require('initialNodeCount')),
    location: gcpClusterConfig.require('location'),
    minMasterVersion: gcpClusterConfig.require('minMasterVersion'),
    nodeConfig: {
      machineType: gcpClusterConfig.require('machineType'),
    },
  });
  return pulumi.output(gcpCluster);
}
