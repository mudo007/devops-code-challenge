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
      deletionProtection: false,
    })),
  },
}));

// Mock pulumi.Config
jest.mock('@pulumi/pulumi', () => {
  const actualPulumi = jest.requireActual('@pulumi/pulumi');
  return {
    ...actualPulumi,
    Config: jest.fn().mockImplementation((name: string) => {
      return {
        require: (key: string) => {
          if (name === 'gcp') {
            switch (key) {
              case 'project':
                return 'mock-project-id';
              case 'region':
                return 'us-central1';
              default:
                throw new Error(`Unknown config key: ${key}`);
            }
          } else if (name === 'gcp-cluster') {
            switch (key) {
              case 'initialNodeCount':
                return '3';
              case 'deletionProtection':
                return 'false';
              case 'machineType':
                return 'e2-micro';
              default:
                throw new Error(`Unknown config key: ${key}`);
            }
          } else {
            throw new Error(`Unknown config namespace: ${name}`);
          }
        },
      };
    }),
  };
});

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

  it('should not have deletion protection', async () => {
    expect(cluster?.deletionProtection).toBe(false);
  });
});
