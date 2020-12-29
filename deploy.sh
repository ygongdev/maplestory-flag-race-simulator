#!/bin/bash

# Normal subtree push doesn't work sometimes due to failure to push to remote, so have to use the split strategy. Windows doesn't like nested commands, so using bash
git push origin $(git subtree split --prefix dist main):gh-pages --force
