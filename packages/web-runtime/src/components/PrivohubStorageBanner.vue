<template>
  <div
    v-if="level"
    class="privohub-storage-banner flex flex-wrap items-center justify-center gap-x-3 gap-y-1 px-4 py-2 text-center"
    :class="
      level === 'full'
        ? 'bg-role-error-container text-role-on-error-container'
        : 'bg-role-surface-container text-role-on-surface'
    "
    role="status"
  >
    <oc-icon
      name="hard-drive-2"
      size="small"
      fill-type="line"
      :accessible-label="$gettext('Storage')"
    />
    <span class="text-sm" v-text="message" />
    <oc-button
      id="privohub-storage-banner-manage"
      type="a"
      appearance="raw"
      size="small"
      :href="manageStorageUrl"
      target="_blank"
    >
      <span class="text-sm underline" v-text="$gettext('Manage storage')" />
    </oc-button>
    <oc-button
      v-if="level === 'nearing'"
      id="privohub-storage-banner-dismiss"
      appearance="raw"
      size="small"
      :aria-label="$gettext('Dismiss')"
      @click="dismiss"
    >
      <oc-icon name="close" size="small" fill-type="line" />
    </oc-button>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, unref } from 'vue'
import { useGettext } from 'vue3-gettext'
import { formatFileSize, useSpacesStore } from '@opencloud-eu/web-pkg'
import { portalUrl } from '../helpers/privohub'

/**
 * PrivoHub: warns before uploads start failing.
 *
 * The pair below is the tenant's plan and the real usage of the ZFS dataset
 * behind it, reported by our graph service (see privohubFilesystemQuota in the
 * server fork). Photos and Drive share that dataset, so this figure includes
 * photos, thumbnails and transcodes as well as files - which is why the
 * message says so rather than letting someone conclude their Drive alone
 * filled the plan.
 *
 * The ZFS refquota is the actual enforcement and sits at the same number, so
 * "full" here means writes are already being refused, not that they are about
 * to be.
 *
 * Deliberately says nothing about *why* the plan is what it is. A tenant whose
 * payment failed has been dropped to the free tier and will land here too, and
 * this app has no channel telling it that - so the copy points at the portal,
 * which does know, instead of guessing at "upgrade".
 */

const NEARING_PERCENT = 90
const DISMISS_KEY = 'privohub-storage-banner-dismissed'

const { $gettext, current: currentLanguage } = useGettext()
const spacesStore = useSpacesStore()

const dismissed = ref(sessionStorage.getItem(DISMISS_KEY) === '1')

const quota = computed(() => spacesStore.personalSpace?.spaceQuota)

const total = computed(() => unref(quota)?.total || 0)
const used = computed(() => unref(quota)?.used || 0)

const usedPercent = computed(() => {
  const t = unref(total)
  return t > 0 ? (unref(used) / t) * 100 : 0
})

const level = computed<'full' | 'nearing' | null>(() => {
  // total 0 means unlimited, which a tenant never is, but an unset env var
  // would produce it and a banner about a quota that is not applied would be
  // wrong rather than merely noisy.
  if (unref(total) <= 0) {
    return null
  }
  if (unref(used) >= unref(total)) {
    return 'full'
  }
  if (unref(usedPercent) >= NEARING_PERCENT && !unref(dismissed)) {
    return 'nearing'
  }
  return null
})

const message = computed(() => {
  const values = {
    used: formatFileSize(unref(used), currentLanguage),
    total: formatFileSize(unref(total), currentLanguage),
    percentage: Math.floor(unref(usedPercent)).toString()
  }

  return unref(level) === 'full'
    ? $gettext(
        'Your storage is full (%{used} of %{total}). Uploads will fail until you free up space or change your plan. This space is shared with your photos.',
        values
      )
    : $gettext(
        'You have used %{percentage}% of your storage (%{used} of %{total}). This space is shared with your photos.',
        values
      )
})

const manageStorageUrl = portalUrl('/storage')

const dismiss = () => {
  dismissed.value = true
  sessionStorage.setItem(DISMISS_KEY, '1')
}
</script>
