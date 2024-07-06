/* eslint-disable no-case-declarations */
import * as pulumi from '@pulumi/pulumi';
import * as gcp from '@pulumi/gcp';
import { gcpCreateCluster } from './gcp/cluster';
import { gcpCreateNetwork } from './gcp/network';
import { enableGcpApis } from './gcp/api';
import { createServiceAccountKeyAndStoreSecret } from './gcp/serviceAccount';

// Abstracts away the creation of a cluster on different cloud providers
export class Cluster {
  k8sCluster: pulumi.Output<gcp.container.Cluster>;

  constructor(name: string, cloudProvider: string) {
    switch (cloudProvider) {
      case 'gcp':
        enableGcpApis();
        const { serviceAccount: clusterSa } =
          createServiceAccountKeyAndStoreSecret('cluster', [
            'roles/container.admin',
            'roles/compute.networkAdmin',
          ]);
        const { vpc, vpcSubnet } = gcpCreateNetwork(name);
        this.k8sCluster = gcpCreateCluster(name, vpc, vpcSubnet, clusterSa);
        break;
      default:
        throw new Error(`Unknown cloud provider: ${cloudProvider}`);
    }
  }
}
