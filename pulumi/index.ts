import * as pulumi from "@pulumi/pulumi";
import { Cluster } from "./src/cloud";

const config = new pulumi.Config();
const cloudProvider = config.require("cloudProvider");

const cluster = new Cluster("kanastra-cluster", cloudProvider);

export const k8sCluster = cluster.k8sCluster;
