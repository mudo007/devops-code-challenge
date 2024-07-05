import * as gcp from '@pulumi/gcp';
import * as pulumi from '@pulumi/pulumi';

// Global setups for google cloud
const gcpConfig = new pulumi.Config('gcp');
const gcpClusterConfig = new pulumi.Config('gcp-cluster');
pulumi.runtime.setConfig('gcp:project', gcpConfig.require('project'));
pulumi.runtime.setConfig('gcp:region', gcpConfig.require('region'));

// Cluster specific configurations
const location = gcpConfig.require('region');
const initialNodeCount = Number(gcpClusterConfig.require('initialNodeCount'));
const deletionProtection =
  gcpClusterConfig.require('deletionProtection') === 'true';
const machineType = gcpClusterConfig.require('machineType');

export function gcpCreateCluster(
  name: string
): pulumi.Output<gcp.container.Cluster> {
  const gcpCluster = new gcp.container.Cluster(name, {
    initialNodeCount: initialNodeCount,
    location: location,
    nodeConfig: {
      machineType: machineType,
    },
    deletionProtection: deletionProtection,
  });
  return pulumi.output(gcpCluster);
}
