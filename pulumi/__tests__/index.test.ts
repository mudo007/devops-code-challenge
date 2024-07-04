import * as pulumi from "@pulumi/pulumi";
import * as gcp from "@pulumi/gcp";
import { Cluster } from "../src/cloud";

// Mock Pulumi and GCP
jest.mock("@pulumi/gcp", () => ({
  container: {
    Cluster: jest.fn(() => ({
      id: "mock-cluster-id",
      location: "us-east",
      initialNodeCount: 1,
    })),
  },
}));

describe("GKE Cluster", () => {
  let cluster: gcp.container.Cluster;

  beforeAll(async () => {
    const stack = await pulumi.runtime.runInPulumiStack(async () => {
      const cluster = new Cluster("test-cluster", "gcp");
      return {
        cluster: cluster.k8sCluster,
      };
    });
    cluster = await stack.cluster.promise();
  });

  it("should create a GKE cluster", () => {
    expect(cluster).toBeDefined();
  });

  it("should have the correct node count", () => {
    expect(cluster.initialNodeCount).toBe(1);
  });

  it("should have the correct location", () => {
    expect(cluster.location).toBe("us-east1");
  });
});
