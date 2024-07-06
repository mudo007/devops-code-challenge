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

//Creates the GKE
export function gcpCreateCluster(
  name: string,
  vpc: gcp.compute.Network,
  vpcSubnet: gcp.compute.Subnetwork
): pulumi.Output<gcp.container.Cluster> {
  const gcpCluster = new gcp.container.Cluster(name, {
    initialNodeCount: initialNodeCount,
    location: location,
    nodeConfig: {
      machineType: machineType,
    },
    deletionProtection: deletionProtection,
    network: vpc.id,
    subnetwork: vpcSubnet.id,
    ipAllocationPolicy: {
      clusterSecondaryRangeName: 'pods',
      servicesSecondaryRangeName: 'services',
    },
  });
  return pulumi.output(gcpCluster);
}
