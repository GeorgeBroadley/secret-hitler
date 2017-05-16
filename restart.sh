#!/bin/sh

git fetch origin master
git rebase origin/master
sudo service secrethitler restart
