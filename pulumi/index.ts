import * as pulumi from '@pulumi/pulumi';
import { Cluster } from './src/cloud';

const cloudConfig = new pulumi.Config('cloud');
const cloudProvider = cloudConfig.require('cloudProvider');

const cluster = new Cluster('kanastra-cluster', cloudProvider);

export const clusterName = cluster.k8sCluster.name;
export const kubeconfig = cluster.k8sKubeConfig;
