# PRIVOHUB.md — PrivoHub Drive (OpenCloud Web fork)

## What this fork is

The web client for **PrivoHub Drive**, forked from `opencloud-eu/web`. It exists
for **one change**: sizes are formatted in **IEC units** (KiB/MiB/GiB) instead of
upstream's decimal base 10. Everything else tracks upstream.

That change is not cosmetic. PrivoHub enforces storage quota with a ZFS
`refquota`, which is binary. With decimal formatting the number a user sees and
the cap actually enforced disagree by ~10%, so Drive could show free space while
writes were already being refused.

## This fork is public — and must be

`opencloud-eu/web` is **AGPL-3.0**. We serve a modified build of it to users over
a network, so **AGPL §13 obliges us to publish the modified source**. That is why
this repo exists.

The sibling server fork (`opencloud`) is **Apache-2.0**, which carries no such
obligation — the two repos are under genuinely different licenses. Don't reason
about one from the other.

| | Private | Public |
|---|---|---|
| Remote | `origin` / `gitea` | `github` (`PrivoHub/opencloud-web`) |
| Branch | `privohub/v7.2.0` | `privohub/v7.2.0` |
| Contents | identical | identical |

**Unlike the Photos and Vault forks, nothing is stripped here.** There is no
internal tooling, no registry path and no private host in this repo, so both
remotes carry the same branch at the same SHAs. Keep it that way: if an
internal-only file is ever needed here it would have to be stripped from the
public branch, and that machinery does not exist in this repo.

Never put a registry hostname, cluster IP, or personal name/email in this repo.

### Identity

Commits are authored, signed and pushed by the `privohub-bot` machine account,
never a person. Per clone (`--local`, so it cannot leak elsewhere):

```bash
git config --local user.name "PrivoHub" && git config --local user.email "307078255+privohub-bot@users.noreply.github.com" && git config --local user.signingkey ~/.ssh/privohub-bot.pub && git config --local gpg.format ssh && git config --local gpg.ssh.program ssh-keygen && git config --local commit.gpgsign true
```

The `github` remote uses the `github-privohub` SSH alias (pinned to
`~/.ssh/privohub-bot`), which is what makes the **push event** show as the bot.
Do not add `Co-Authored-By`/`Signed-off-by` trailers naming a person.

## The version lockstep rule — this is the one that bites

The branch is named for the upstream tag it sits on (`privohub/v7.2.0`), and that
tag **must equal `WEB_ASSETS_VERSION` in the server fork's
`services/web/Makefile`**. The server embeds the built web bundle; if the two
drift, Drive ships a client built from a different release than the server
expects.

On an upstream bump:

1. Branch from the new tag: `git checkout -b privohub/vX.Y.Z vX.Y.Z`
2. Cherry-pick the IEC commit onto it, then re-run the filesize tests.
3. Push to both remotes, and set the server fork's `WEB_ASSETS_VERSION` to the
   same tag in the same change.

## History: this used to be a patched bundle

Before this fork, the IEC change was a `sed` in the **server** repo's
`services/web/Makefile` (`privohub-patch-filesize`), rewriting `,base:10,output:`
inside the already-minified bundle downloaded from upstream's release.

It worked, but it modified AGPL code with **no corresponding source anywhere** —
the very thing AGPL requires. It was also the same fragility the Vault fork hit
with minified-JS patching: an upstream rebundle silently moves the target.

So: **make the change here, in source.** Reaching for a post-build patch on the
bundle again is the signal to add a commit to this fork instead.
