import * as gcp from '@pulumi/gcp';
import * as pulumi from '@pulumi/pulumi';

// Configuration
const gcpConfig = new pulumi.Config('gcp');
const gcrConfig = new pulumi.Config('gcp-gar');
const location = gcpConfig.require('region');
const project = gcpConfig.require('project');

// Create an Artifact repository
export function createArtifactRepository(): gcp.artifactregistry.Repository {
  const ArtifactRepositoryName = gcrConfig.require('garName');
  return new gcp.artifactregistry.Repository(ArtifactRepositoryName, {
    format: 'DOCKER',
    location: location,
    repositoryId: `${ArtifactRepositoryName}-docker-repo`,
    project: project,
  });
}
