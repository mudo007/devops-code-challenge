import * as pulumi from '@pulumi/pulumi';
import * as gcp from '@pulumi/gcp';
import { Cluster } from '../src/cloud';

// Mock Pulumi and GCP
jest.mock('@pulumi/gcp', () => ({
  container: {
    Cluster: jest.fn(() => ({
      id: 'mock-cluster-id',
      location: 'us-central1',
      initialNodeCount: 3,
    })),
  },
}));

describe('GKE Cluster', () => {
  let cluster: gcp.container.Cluster;

  beforeAll(async () => {
    await pulumi.runtime.runInPulumiStack(async () => {
      const clusterInstance = new Cluster('test-cluster', 'gcp');
      clusterInstance.k8sCluster.apply((c) => {
        cluster = c as gcp.container.Cluster;
      });
    });
  });

  it('should create a GKE cluster', () => {
    expect(cluster).toBeDefined();
  });

  it('should have the correct node count', () => {
    expect(cluster?.initialNodeCount).toBe(3);
  });

  it('should have the correct location', () => {
    expect(cluster?.location).toBe('us-central1');
  });
});
