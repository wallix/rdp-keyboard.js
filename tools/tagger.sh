#!/usr/bin/env bash

cd "$(dirname "$0")/.."

get_version() {
    sed -E '/^ReversedKeymap\.version/!d;s/^[^"]+"([^"]+).*/\1/;q' lib/scancodes.js
}

set_version() {
    sed -i -E 's/^ReversedKeymap\.version = .*/ReversedKeymap.version = "'"$1"'";/' lib/scancodes.js
}

current_version=$(get_version) || exit $?
progname="$0"

usage()
{
    echo 'usage:' >&2
    echo "  $progname -u,--update-version new-version [-p,--push]" >&2
    echo "  $progname -g,--get-version" >&2
    echo "current version: $current_version"
    exit 1
}

TEMP=`getopt -o 'gpfu:' -l 'get-version,push,update-version:' -- "$@"`

if [ $? != 0 ] ; then usage >&2 ; fi

eval set -- "$TEMP"

new_version=
gver=0
push=0
force_vers=0
while :; do
  case "$1" in
    -g|--get-version) gver=1; shift ;;
    -p|--push) push=1; shift ;;
    -u|--update-version)
        [[ -z "$2" ]] && usage
        new_version="$2"
        shift 2
        ;;
    --) shift; break ;;
    * ) usage ;;
  esac
done


if [[ $gver = 1 ]] ; then
    echo "$current_version"
    exit
fi


if [[ -z "$new_version" ]] ; then
    usage
fi

greater_version()
{
    [[ "$current_version" != "$new_version" ]] && {
        local t=$(echo -e "$current_version\n$new_version")
        [[ "$(echo "$t" | sort -V)" = "$t" ]]
    }
}

if [[ $force_vers -eq 0 ]] && ! greater_version "$new_version" "$current_version"  ; then
    echo version "$current_version" is less than or equal to "$new_version"
    exit 1
fi

gdiff=$(GIT_PAGER=cat git diff --shortstat)

if (( $? != 0 )) || [[ "$gdiff" != '' ]] ; then
    echo -e "your repository has uncommited changes:\n$gdiff\nPlease commit before packaging." >&2
    exit 2
fi

check_tag()
{
    grep -m1 -o "^$new_version$" && {
        echo "tag $new_version already exists ("$1")."
        exit 2
    }
    return 0
}

echo "Check tag"

git tag --list | check_tag locale || exit $?
git ls-remote --tags origin | sed 's#.*/##' | check_tag remote || exit $?


set -e

echo "Update version"

set_version "$new_version"

git commit -am "update to $new_version"
git tag "$new_version"

if [[ $push = 1 ]]; then
    git push && git push --tags
fi
