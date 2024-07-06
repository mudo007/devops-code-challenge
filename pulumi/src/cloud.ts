/* eslint-disable no-case-declarations */
import * as pulumi from '@pulumi/pulumi';
import { gcpCreateCluster } from './gcp/cluster';
import { gcpCreateNetwork } from './gcp/network';
import * as gcp from '@pulumi/gcp';

// Abstracts away the creation of a cluster on different cloud providers
export class Cluster {
  k8sCluster: pulumi.Output<gcp.container.Cluster>;

  constructor(name: string, cloudProvider: string) {
    switch (cloudProvider) {
      case 'gcp':
        const { vpc, vpcSubnet } = gcpCreateNetwork(name);
        this.k8sCluster = gcpCreateCluster(name, vpc, vpcSubnet);
        break;
      default:
        throw new Error(`Unknown cloud provider: ${cloudProvider}`);
    }
  }
}
