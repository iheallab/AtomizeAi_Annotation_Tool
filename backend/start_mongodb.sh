#!/bin/bash
#SBATCH --job-name=mongodb
#SBATCH --mail-type=END,FAIL
#SBATCH --mail-user=hrudayte.akkalad@ufl.edu
#SBATCH --ntasks=1
#SBATCH --mem=4gb
#SBATCH --time=14-10:00:00
#SBATCH --output=mongodb.log
date; pwd

hostname=$(hostname)
echo -e "MONGODB_HOSTNAME:${hostname}"

module load mongodb

if [[ x${MONGODB_PORT} == 'x' ]]; then
    MONGODB_PORT=$(shuf -i 2000-65000 -n 1)
fi
echo -e "MONGODB_PORT:${MONGODB_PORT}"

if [[ x${MONGODB_PATH} == 'x' ]]; then
    my_username=$(id -un)
    my_primary_group=$(id -gn)
    MONGODB_PATH="/ufrc/${my_primary_group}/${my_username}/mongodb"
fi

echo "Starting MongoDB on host ${hostname} and port ${MONGODB_PORT}"

mongod --dbpath=${MONGODB_PATH} --bind_ip=0.0.0.0 --port=${MONGODB_PORT}

date
