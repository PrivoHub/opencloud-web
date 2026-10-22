# PRIVOHUB.md: PrivoHub Drive (OpenCloud Web fork)

## What this fork is

The web client for **PrivoHub Drive**, forked from `opencloud-eu/web`. Everything
tracks upstream except a small set of changes:

- **Decimal file sizes** (`packages/web-pkg/src/helpers/filesize.ts`): sizes are
  shown in kB/MB/GB (powers of 1000), matching how PrivoHub states storage
  everywhere else.
- **Portal links and a storage notice** (`packages/web-runtime`): account-menu
  links to the PrivoHub portal and a banner when storage runs low or is full.
  `helpers/privohub.ts` must stay identical to its twin in the Photos (Immich)
  fork, so the same button lands in the same place from either app.
- **`logoPlain` theme key** (`web-pkg` theme schema, `web-runtime` `PlainShell`): the
  plain pages (public link password, access denied, logged out) sit on the
  surface colours while `logo` sits on the top bar, so a theme with a dark top bar
  needs a second logo for them. Falls back to `logo`.

## This fork is public, and must be

`opencloud-eu/web` is **AGPL-3.0**. We serve a modified build of it to users over
a network, so **AGPL section 13 obliges us to publish the modified source**. That is
why this repo exists, and why a branch must be public **before** a build of it is
served.

The sibling server fork (`opencloud`) is **Apache-2.0**, which carries no such
obligation. Don't reason about one from the other.

| | Private | Public |
|---|---|---|
| Remote | `origin` | `public` (mirrored to `github.com/PrivoHub/opencloud-web`) |
| Branch | `privohub/v8.1.0` | `privohub/v8.1.0` |
| Contents | identical | identical |

**Unlike the other forks, nothing is stripped here.** Both remotes carry the same
branch at the same SHAs. Keep it that way: if an internal-only file is ever needed
here it would have to be stripped from the public branch, and that machinery does
not exist in this repo. Never put a registry hostname, cluster IP, internal
detail, or personal name/email in this repo. Commit messages are public as
written: keep them short and plain.

Older branches (`privohub/v7.2.0`, `privohub/v6.2.0`) stay as history; each
upstream bump gets a new branch, never a rewrite of a published one.

### Identity

Commits are authored, signed and pushed by the `privohub-bot` machine account,
never a person. Per clone (`--local`, so it cannot leak elsewhere):

```bash
git config --local user.name "PrivoHub" && git config --local user.email "307078255+privohub-bot@users.noreply.github.com" && git config --local user.signingkey ~/.ssh/privohub-bot.pub && git config --local gpg.format ssh && git config --local gpg.ssh.program ssh-keygen && git config --local commit.gpgsign true
```

Do not add `Co-Authored-By`/`Signed-off-by` trailers naming a person.

## The version lockstep rule

The branch is named for the upstream web tag it sits on (`privohub/v8.1.0`). The
server fork builds this branch into its image from `WEB_ASSETS_REF` (in both
`services/web/Makefile` and `opencloud/docker/Dockerfile.multiarch`), and the tag
must be the one upstream pairs with the server tag that fork sits on (upstream's
own `WEB_ASSETS_VERSION` for that server release). If they drift, Drive ships a
client built for a different server release.

On an upstream bump:

1. Branch from the new tag: `git switch -c privohub/vX.Y.Z vX.Y.Z`
2. Cherry-pick the fork commits onto it, then run the unit tests
   (`pnpm test:unit --run`). Expect snapshot drift in our UserMenu entries when
   upstream changes shared components; check the diff is only that before `-u`.
3. Push to `origin`, then `public`, and set the server fork's `WEB_ASSETS_REF` to
   the new branch in the same change.
4. Make the new branch the default branch of both Forgejo repos and the GitHub
   mirror (the mirror copies refs, never the default-branch setting).

## Make changes in source

The decimal-size change used to be a `sed` over the minified upstream bundle in
the server repo. That modified AGPL code with no corresponding source, and broke
whenever upstream rebundled. **Make changes here, in source.** Reaching for a
post-build patch on the bundle again is the signal to add a commit to this fork
instead.
