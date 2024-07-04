import * as gcp from '@pulumi/gcp';
import * as pulumi from '@pulumi/pulumi';

export function createCluster(
  name: string
): pulumi.Output<gcp.container.Cluster> {
  const cluster = new gcp.container.Cluster(name, {
    initialNodeCount: 1,
    location: 'us-east1',
    minMasterVersion: '1.18',
    nodeConfig: {
      machineType: 'e2-micro',
    },
  });

  return pulumi.output(cluster);
}
