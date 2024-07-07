/* eslint-disable no-case-declarations */
import * as pulumi from '@pulumi/pulumi';
import * as gcp from '@pulumi/gcp';
import { gcpCreateCluster } from './gcp/cluster';
import { gcpCreateNetwork } from './gcp/network';
import { enableGcpApis } from './gcp/api';
import { createServiceAccountKeyAndStoreSecret } from './gcp/serviceAccount';
import { createArtifactRepository } from './gcp/gar';

// Abstracts away the creation of a cluster on different cloud providers
export class Cluster {
  k8sCluster: pulumi.Output<gcp.container.Cluster>;

  constructor(name: string, cloudProvider: string) {
    // This switch-case is a placeholder for multi-cloud deployments
    switch (cloudProvider) {
      case 'gcp':
        //Early enabling of all necessary GCP API's
        enableGcpApis();

        //Create the necessary Service accounts, with their granular permitions
        //cluster creation
        const { serviceAccount: clusterCreateSa } =
          createServiceAccountKeyAndStoreSecret('cluster-create', [
            'roles/container.admin',
            'roles/compute.networkAdmin',
          ]);
        // container push and deployment from github actions
        createServiceAccountKeyAndStoreSecret('cluster-deploy', [
          'roles/container.developer',
          'roles/artifactregistry.writer'
        ]);
        // Create the Artifact Registry
        createArtifactRepository();
        // Create the networking configuration
        const { vpc, vpcSubnet } = gcpCreateNetwork(name);

        // Finally create the cluster
        this.k8sCluster = gcpCreateCluster(
          name,
          vpc,
          vpcSubnet,
          clusterCreateSa
        );
        break;
      // case 'aws':
      //   ...
      //   break;
      default:
        throw new Error(`Unknown cloud provider: ${cloudProvider}`);
    }
  }
}
