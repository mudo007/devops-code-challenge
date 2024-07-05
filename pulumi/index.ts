import * as pulumi from '@pulumi/pulumi';
import { Cluster } from './src/cloud';

const cloudConfig = new pulumi.Config('cloud');
const cloudProvider = cloudConfig.require('cloudProvider');

const cluster = new Cluster('kanastra-cluster', cloudProvider);

export const k8sCluster = cluster.k8sCluster;
