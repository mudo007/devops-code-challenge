import * as pulumi from '@pulumi/pulumi';
import { gcpCreateCluster } from './gcp/cluster';
import * as gcp from '@pulumi/gcp';

export class Cluster {
  k8sCluster: pulumi.Output<gcp.container.Cluster>;

  constructor(name: string, cloudProvider: string) {
    switch (cloudProvider) {
      case 'gcp':
        this.k8sCluster = gcpCreateCluster(name);
        break;
      default:
        throw new Error(`Unknown cloud provider: ${cloudProvider}`);
    }
  }
}
