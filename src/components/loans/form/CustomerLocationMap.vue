<template>
  <div class="space-y-6">
    <div v-if="isLoading" class="text-center py-12">
      <div class="loading loading-spinner loading-lg text-primary"></div>
      <p class="mt-2 text-gray-500">ກຳລັງໂຫຼດຂໍ້ມູນແຜນທີ່...</p>
    </div>

    <div v-else-if="locations.length === 0 && !canAddLocation" class="text-center py-12 text-gray-500">
      <div class="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
        <span class="icon-[tabler--map-pin-off] size-8 text-gray-400"></span>
      </div>
      <p class="text-lg font-medium">ບໍ່ມີຂໍ້ມູນທີ່ຢູ່</p>
      <p class="text-sm text-gray-500 mt-1">ຍັງບໍ່ມີຂໍ້ມູນແຜນທີ່ສຳລັບລູກຄ້ານີ້</p>
    </div>

    <div v-else class="space-y-4">
      <div class="flex justify-between items-center">
        <div class="flex items-center gap-2 text-sm text-gray-500">
          <span class="icon-[tabler--map-pin] size-4"></span>
          <span>{{ locations.length > 0 ? `ພົບ ${locations.length} ຕຳແໜ່ງ` : 'ຍັງບໍ່ມີຕຳແໜ່ງ' }}</span>
        </div>

        <button v-if="canAddLocation" class="btn btn-sm btn-primary" @click="enableAddLocationMode"
          :disabled="isAddingLocation">
          <span class="icon-[tabler--plus] size-4 mr-1"></span>
          {{ isAddingLocation ? 'ກຳລັງປັກຈຸດ...' : 'ເພີ່ມທີ່ຢູ່' }}
        </button>
      </div>

      <div class="card bg-base-200 p-4 rounded-lg border border-base-content/10 relative">
        <div ref="mapContainer" class="w-full rounded-lg overflow-hidden map-container" style="height: 384px;"
          :class="{ 'cursor-crosshair': isAddingLocation }"></div>
      </div>

      <Teleport to="body">
        <div v-if="isAddingLocation" class="fixed bottom-8 left-1/2 -translate-x-1/2 z-[1000] w-full max-w-md px-4">
          <div
            class="p-3 bg-primary text-primary-content rounded-lg shadow-lg text-sm flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="icon-[tabler--info-circle] size-4"></span>
              <span><strong>ໝາຍເຫດ:</strong> ຄລິກໃສ່ແຜນທີ່ເພື່ອປັກຈຸດຕຳແໜ່ງ</span>
            </div>
            <button class="btn btn-xs btn-ghost text-primary-content hover:bg-primary-focus"
              @click="disableAddLocationMode">
              ຍົກເລີກ
            </button>
          </div>
        </div>
      </Teleport>

      <div v-if="locations.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div v-for="location in locations" :key="location.id"
          class="card bg-base-100 p-4 rounded-lg border border-base-content/10"
          :class="{ 'border-primary border-2': location.is_primary }">
          <div class="flex items-start justify-between mb-3">
            <div class="flex items-center gap-2">
              <span class="icon-[tabler--map-pin] size-5" :class="{
                'text-primary': location.location_type === 'home',
                'text-success': location.location_type === 'work',
                'text-gray-500': location.location_type === 'other'
              }"></span>
              <div>
                <h4 class="font-semibold">
                  {{ getLocationTypeLabel(location.location_type) }}
                  <span v-if="location.is_primary" class="badge badge-xs badge-primary ml-1">ຫຼັກ</span>
                </h4>
                <p class="text-xs text-gray-500 truncate max-w-[200px]">{{ location.address }}</p>
              </div>
            </div>

            <div class="flex gap-1">
              <button v-if="canEditLocation" class="btn btn-ghost btn-xs" @click="editLocation(location)">
                <span class="icon-[tabler--edit] size-3"></span>
              </button>
              <button v-if="canDeleteLocation" class="btn btn-ghost btn-xs text-error"
                @click="deleteLocation(location.id)">
                <span class="icon-[tabler--trash] size-3"></span>
              </button>
            </div>
          </div>

          <div v-if="location.latitude && location.longitude" class="text-xs text-gray-500 font-mono">
            📍 {{ Number(location.latitude).toFixed(6) }}, {{ Number(location.longitude).toFixed(6) }}
          </div>

          <div class="flex gap-2 mt-3">
            <a v-if="location.latitude && location.longitude"
              :href="getGoogleMapsLink(location.latitude, location.longitude)" target="_blank"
              class="btn btn-xs btn-ghost flex-1">
              <span class="icon-[tabler--external-link] size-3 mr-1"></span>
              ເປີດ Google Maps
            </a>
            <button v-if="!location.is_primary && canSetPrimary" class="btn btn-xs btn-outline btn-primary"
              @click="setAsPrimary(location)">
              ຕັ້ງເປັນຫຼັກ
            </button>
          </div>
        </div>
      </div>
    </div>

    <teleport to="body">
      <div v-if="showLocationModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
          <h3 class="text-lg font-bold mb-4">
            {{ editingLocation ? 'ແກ້ໄຂທີ່ຢູ່' : 'ເພີ່ມທີ່ຢູ່ໃໝ່' }}
          </h3>

          <div class="space-y-4">

            <div class="form-control bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
              <label class="label pt-0">
                <span class="label-text font-medium text-blue-700 dark:text-blue-300">
                  <span class="icon-[tabler--link] size-4 inline mr-1 align-text-bottom"></span>
                  ວາງລີ້ງແຜນທີ່ (Paste Google Maps Link)
                </span>
              </label>
              <input
                v-model="pastedMapUrl"
                @input="handleMapLinkPaste"
                type="text"
                class="input input-bordered border-blue-200 focus:border-blue-400 w-full"
                placeholder="ຕົວຢ່າງ: https://maps.google.com/maps?q=17.9757,102.6331..."
              />
              <label class="label pb-0">
                <span class="label-text-alt text-gray-500">ລະບົບຈະດຶງຄ່າ Lat/Lng ແລະ ປັກໝຸດອັດຕະໂນມັດ</span>
              </label>
            </div>
            <div class="form-control">
              <label class="label">
                <span class="label-text font-medium">ປະເພດທີ່ຢູ່ *</span>
              </label>
              <select v-model="locationForm.location_type" class="select select-bordered w-full">
                <option value="home">ບ້ານຢູ່</option>
                <option value="work">ທີ່ເຮັດວຽກ</option>
                <option value="other">ອື່ນໆ</option>
              </select>
            </div>

            <div class="form-control">
              <label class="label">
                <span class="label-text font-medium">ທີ່ຢູ່ *</span>
              </label>
              <textarea v-model="locationForm.address" class="textarea textarea-bordered w-full min-h-20"
                placeholder="ປ້ອນທີ່ຢູ່ເຕັມ"></textarea>
              <label class="label">
                <span class="label-text-alt text-info">
                  <span class="icon-[tabler--bulb] size-3 inline"></span>
                  ຫຼື <button type="button" @click="reverseGeocode" class="link link-info">ດຶງທີ່ຢູ່ຈາກຕຳແໜ່ງ (Auto fill)</button>
                </span>
              </label>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div class="form-control">
                <label class="label">
                  <span class="label-text font-medium">ລາຕິຈູດ (Lat)</span>
                </label>
                <input v-model="locationForm.latitude" type="text" class="input input-bordered w-full" readonly />
              </div>
              <div class="form-control">
                <label class="label">
                  <span class="label-text font-medium">ລອງຈິຈູດ (Lng)</span>
                </label>
                <input v-model="locationForm.longitude" type="text" class="input input-bordered w-full" readonly />
              </div>
            </div>

            <div class="form-control">
              <label class="flex items-center gap-2 cursor-pointer mt-2">
                <input v-model="locationForm.is_primary" type="checkbox" class="checkbox checkbox-primary"
                  :checked="locationForm.is_primary === 1" @change="toggleIsPrimary" />
                <span class="label-text font-medium">ຕັ້ງເປັນທີ່ຢູ່ຫຼັກ (Primary)</span>
              </label>
            </div>
          </div>

          <div class="flex justify-end gap-3 mt-8">
            <button class="btn btn-soft btn-secondary" @click="closeLocationModal">
              ຍົກເລີກ
            </button>
            <button class="btn btn-primary" @click="saveLocation"
              :disabled="!locationForm.latitude || !locationForm.longitude">
              <span class="icon-[tabler--device-floppy] size-4 mr-1"></span>
              {{ editingLocation ? 'ບັນທຶກການແກ້ໄຂ' : 'ບັນທຶກທີ່ຢູ່' }}
            </button>
          </div>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import type { CustomerLocation } from '@/types/loanApplication'

const props = defineProps<{
  customerId: number
  locations?: CustomerLocation[]
  isLoading?: boolean
  canAddLocation?: boolean
  canEditLocation?: boolean
  canDeleteLocation?: boolean
  canSetPrimary?: boolean
  googleMapsApiKey?: string
}>()

const emit = defineEmits<{
  (e: 'add-location', location: Omit<CustomerLocation, 'id'>): void
  (e: 'update-location', id: number, location: Partial<CustomerLocation>): void
  (e: 'delete-location', id: number): void
  (e: 'set-primary', id: number): void
}>()

const mapContainer = ref<HTMLElement | null>(null)
const map = ref<google.maps.Map | null>(null)
const markers = ref<google.maps.Marker[]>([])
const tempMarker = ref<google.maps.Marker | null>(null)
const geocoder = ref<google.maps.Geocoder | null>(null)

const isAddingLocation = ref(false)
const showLocationModal = ref(false)
const editingLocation = ref<CustomerLocation | null>(null)
const isMapLoaded = ref(false)

// 🟢 ປະກາດຕົວແປສຳລັບຊ່ອງ Paste Link
const pastedMapUrl = ref('')

let clickListener: google.maps.MapsEventListener | null = null

const locationForm = ref({
  location_type: 'home' as 'home' | 'work' | 'other',
  address: '',
  latitude: 0,
  longitude: 0,
  is_primary: 0 as number
})

const locations = computed(() => props.locations || [])

const getLocationTypeLabel = (type: string): string => {
  const map: Record<string, string> = {
    'home': 'ບ້ານຢູ່',
    'work': 'ທີ່ເຮັດວຽກ',
    'other': 'ອື່ນໆ'
  }
  return map[type] || type
}

const getGoogleMapsLink = (lat: number | string, lng: number | string): string => {
  return `http://maps.google.com/maps?q=${Number(lat)},${Number(lng)}`
}

const toggleIsPrimary = () => {
  locationForm.value.is_primary = locationForm.value.is_primary === 1 ? 0 : 1
}

// ✅ ຟັງຊັນດຶງພິກັດຈາກ Link ທີ່ວາງ (Paste Link Logic)
const handleMapLinkPaste = () => {
  const url = pastedMapUrl.value.trim();
  if (!url) return;

  let lat: number | null = null;
  let lng: number | null = null;

  // 1. ແຍກພິກັດຈາກຮູບແບບ @lat,lng (Google Maps ເທິງເວັບ)
  // ຕົວຢ່າງ: https://www.google.com/maps/place/.../@17.9757,102.6331,15z
  const atMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (atMatch) {
    lat = parseFloat(atMatch[1]);
    lng = parseFloat(atMatch[2]);
  }

  // 2. ແຍກພິກັດຈາກຮູບແບບ ?q=lat,lng ຫລື &q=lat,lng
  // ຕົວຢ່າງ: https://maps.google.com/?q=17.9757,102.6331
  if (!lat || !lng) {
    const qMatch = url.match(/[?&](?:q|ll)=(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (qMatch) {
      lat = parseFloat(qMatch[1]);
      lng = parseFloat(qMatch[2]);
    }
  }

  // 3. ແຍກພິກັດຈາກຮູບແບບທີ່ພິມຕົວເລກລ້ວນໆ "17.9757, 102.6331"
  if (!lat || !lng) {
    const rawMatch = url.match(/^(-?\d+\.\d+)[,\s]+(-?\d+\.\d+)$/);
    if (rawMatch) {
      lat = parseFloat(rawMatch[1]);
      lng = parseFloat(rawMatch[2]);
    }
  }

  if (lat && lng) {
    // ບັນທຶກຄ່າລົງຟອມ
    locationForm.value.latitude = lat;
    locationForm.value.longitude = lng;

    // ເລື່ອນແຜນທີ່ ແລະ ສ້າງ/ຍ້າຍ ໝຸດໄປຫາຕຳແໜ່ງໃໝ່ທັນທີ
    if (map.value) {
      const position = { lat, lng };

      if (tempMarker.value) {
        tempMarker.value.setPosition(position);
      } else {
        tempMarker.value = new google.maps.Marker({
          position,
          map: map.value,
          animation: google.maps.Animation.DROP,
        });
      }

      map.value.panTo(position);
      map.value.setZoom(16);
    }
  } else if (url.includes('maps.app.goo.gl')) {
    // ກໍລະນີເປັນ Short Link (ເຊິ່ງ JavaScript ບໍ່ສາມາດອ່ານ redirect ໄດ້ໂດຍກົງ)
    alert('ລະບົບບໍ່ສາມາດດຶງພິກັດຈາກ Short link ໄດ້ອັດຕະໂນມັດ, ກະລຸນາເປີດລີ້ງໃນ Browser ກ່ອນ ແລ້ວກັອບປີ້ລີ້ງຍາວ (URL) ດ້ານເທິງມາໃສ່ແທນ');
  }
}

// ✅ โหลด Google Maps Script
const loadGoogleMapsScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (window.google && window.google.maps) {
      resolve()
      return
    }

    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]')
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve())
      existingScript.addEventListener('error', () => reject(new Error('Failed to load Google Maps')))
      return
    }

    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${props.googleMapsApiKey}&libraries=places`
    script.async = true
    script.defer = true
    script.addEventListener('load', () => resolve())
    script.addEventListener('error', () => reject(new Error('Failed to load Google Maps')))
    document.head.appendChild(script)
  })
}

// ✅ สร้างแผนที่
const initMap = async () => {
  if (!mapContainer.value) return

  try {
    await loadGoogleMapsScript()

    if (map.value) {
      google.maps.event.clearInstanceListeners(map.value)
      map.value = null
    }

    map.value = new google.maps.Map(mapContainer.value, {
      center: { lat: 17.9757, lng: 102.6331 },
      zoom: 13,
      mapTypeControl: true,
      streetViewControl: true,
      fullscreenControl: true,
      zoomControl: true,
    })

    geocoder.value = new google.maps.Geocoder()
    isMapLoaded.value = true

    updateMarkers()
  } catch (error) {
    console.error('Error initializing Google Maps:', error)
    alert('ບໍ່ສາມາດໂຫຼດແຜນທີ່ໄດ້ ກະລຸນາກວດສອບ API Key')
  }
}

// ✅ จัดการคลิกใส่แผนที่ (เมื่ออยู่ในโหมดเพิ่ม)
const handleMapClick = (e: google.maps.MapMouseEvent) => {
  if (!isAddingLocation.value || !e.latLng) return

  const lat = e.latLng.lat()
  const lng = e.latLng.lng()

  if (tempMarker.value) {
    tempMarker.value.setMap(null)
  }

  tempMarker.value = new google.maps.Marker({
    position: { lat, lng },
    map: map.value,
    animation: google.maps.Animation.DROP,
    icon: {
      url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
    }
  })

  locationForm.value.latitude = lat
  locationForm.value.longitude = lng
  locationForm.value.address = ''
  locationForm.value.location_type = 'home'
  locationForm.value.is_primary = locations.value.length === 0 ? 1 : 0

  pastedMapUrl.value = '' // ເຄຼຍຊ່ອງ Paste ລີ້ງ ເມື່ອປັກໝຸດເອງ

  showLocationModal.value = true
}

// ✅ Reverse Geocoding (แปลงพิกัดเป็นที่อยู่)
const reverseGeocode = async () => {
  if (!geocoder.value || !locationForm.value.latitude || !locationForm.value.longitude) {
    alert('ກະລຸນາປັກຈຸດຕຳແໜ່ງກ່ອນ')
    return
  }

  try {
    const response = await geocoder.value.geocode({
      location: {
        lat: locationForm.value.latitude,
        lng: locationForm.value.longitude
      }
    })

    if (response.results && response.results.length > 0) {
      locationForm.value.address = response.results[0]?.formatted_address || 'ບໍ່ສາມາດອ່ານທີ່ຢູ່ໄດ້'
    } else {
      alert('ບໍ່ພົບຂໍ້ມູນທີ່ຢູ່')
    }
  } catch (error) {
    console.error('Reverse geocoding error:', error)
    alert('ເກີດຂໍ້ຜິດພາດໃນການດຶງທີ່ຢູ່')
  }
}

// ✅ อัปเดต markers จาก props.locations
const updateMarkers = () => {
  if (!map.value || !isMapLoaded.value) return

  markers.value.forEach(marker => marker.setMap(null))
  markers.value = []

  const bounds = new google.maps.LatLngBounds()

  locations.value.forEach(location => {
    if (location.latitude && location.longitude) {
      const position = { lat: Number(location.latitude), lng: Number(location.longitude) }

      const marker = new google.maps.Marker({
        position,
        map: map.value,
        title: getLocationTypeLabel(location.location_type),
        icon: {
          url: location.is_primary
            ? 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
            : 'http://maps.google.com/mapfiles/ms/icons/green-dot.png'
        }
      })

      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="padding: 8px; min-width: 200px;">
            <strong style="font-size: 14px;">${getLocationTypeLabel(location.location_type)}</strong><br>
            <span style="font-size: 12px; color: #666;">${location.address}</span><br>
            ${location.is_primary ? '<strong style="color: #0066cc;">📍 ທີ່ຢູ່ຫຼັກ</strong>' : ''}
          </div>
        `
      })

      marker.addListener('click', () => {
        infoWindow.open(map.value, marker)
      })

      markers.value.push(marker)
      bounds.extend(position)
    }
  })

  if (markers.value.length > 0) {
    map.value!.fitBounds(bounds, 50)
  }
}

const enableAddLocationMode = () => {
  isAddingLocation.value = true

  if (map.value) {
    mapContainer.value!.style.cursor = 'crosshair'
    clickListener = map.value.addListener('click', handleMapClick)
  }
}

const disableAddLocationMode = () => {
  isAddingLocation.value = false

  if (mapContainer.value) {
    mapContainer.value.style.cursor = ''
  }

  if (clickListener) {
    google.maps.event.removeListener(clickListener)
    clickListener = null
  }

  if (tempMarker.value) {
    tempMarker.value.setMap(null)
    tempMarker.value = null
  }
}

const editLocation = (location: CustomerLocation) => {
  editingLocation.value = location
  locationForm.value = {
    location_type: location.location_type,
    address: location.address,
    latitude: location.latitude || 0,
    longitude: location.longitude || 0,
    is_primary: location.is_primary || 0
  }
  pastedMapUrl.value = '' // ເຄຼຍຊ່ອງຕອນກົດແກ້ໄຂ
  showLocationModal.value = true
}

const saveLocation = () => {
  if (!locationForm.value.latitude || !locationForm.value.longitude) {
    alert('ກະລຸນາປັກຈຸດຕຳແໜ່ງໃນແຜນທີ່')
    return
  }

  if (!locationForm.value.address.trim()) {
    alert('ກະລຸນາປ້ອນທີ່ຢູ່')
    return
  }

  if (editingLocation.value) {
    emit('update-location', editingLocation.value.id, {
      location_type: locationForm.value.location_type,
      address: locationForm.value.address,
      latitude: locationForm.value.latitude,
      longitude: locationForm.value.longitude,
      is_primary: locationForm.value.is_primary
    })
  } else {
    emit('add-location', {
      customer_id: props.customerId,
      location_type: locationForm.value.location_type,
      address: locationForm.value.address,
      latitude: locationForm.value.latitude,
      longitude: locationForm.value.longitude,
      is_primary: locationForm.value.is_primary,
      map_url: ''
    })
  }

  closeLocationModal()
}

const deleteLocation = (id: number) => {
  if (confirm('ຕ້ອງການລຶບທີ່ຢູ່ນີ້ບໍ່?')) {
    emit('delete-location', id)
  }
}

const setAsPrimary = (location: CustomerLocation) => {
  emit('set-primary', location.id)
}

const closeLocationModal = () => {
  showLocationModal.value = false
  editingLocation.value = null
  disableAddLocationMode()

  // 🟢 ເຄຼຍຊ່ອງ Paste Link ນຳ
  pastedMapUrl.value = ''

  locationForm.value = {
    location_type: 'home',
    address: '',
    latitude: 0,
    longitude: 0,
    is_primary: 0
  }
}

onMounted(() => {
  initMap()
})

onUnmounted(() => {
  if (clickListener) {
    google.maps.event.removeListener(clickListener)
    clickListener = null
  }

  if (map.value) {
    google.maps.event.clearInstanceListeners(map.value)
    map.value = null
  }

  markers.value.forEach(marker => marker.setMap(null))
  markers.value = []

  if (tempMarker.value) {
    tempMarker.value.setMap(null)
    tempMarker.value = null
  }
})

watch(() => props.isLoading, async (loading) => {
  if (!loading && !map.value) {
    await nextTick()
    initMap()
  }
}, { immediate: true })

watch(() => props.locations, () => {
  updateMarkers()
}, { deep: true })
</script>

<style scoped>
.map-container {
  position: relative;
  z-index: 1;
  height: 384px;
  min-height: 384px;
  background: #e5e3df;
}

.map-container>div {
  border-radius: 0.5rem;
}
</style>
