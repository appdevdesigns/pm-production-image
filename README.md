Base files for building the production [digiserve/ab-process-manager](https://hub.docker.com/repository/docker/digiserve/ab-process-manager) Docker image.


# Preface
Intended to be used in a stack together with the ab-sails-api image. For the 
official stack, please see https://github.com/appdevdesigns/ab-production-stack/

# Requirements
A `local.js` config file must be mounted into the "/app/config/"
directory at runtime. This is the same config file used by the main AppBuilder
process. The included `pm-launcher.js` will wait for Sails to start before
each launching the Process Manager service.


# Example usage
`docker build --no-cache --compress -t digiserve/ab-process-manager .`
