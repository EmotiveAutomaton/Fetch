import Zeroconf from 'react-native-zeroconf'
import { EventEmitter } from 'events'

import { NativeModules, Platform } from 'react-native'

let zeroconf: any
const discoveryEvents = new EventEmitter()
let foundService: any = null

const isZeroconfSupported = Platform.OS !== 'web' && !!NativeModules.RNZeroconf

if (isZeroconfSupported) {
    try {
        zeroconf = new Zeroconf()
        zeroconf.on('start', () => {
            console.log('[Discovery] Scan started.')
        })

        zeroconf.on('stop', () => {
            console.log('[Discovery] Scan stopped.')
        })

        zeroconf.on('resolved', (service: any) => {
            console.log('[Discovery] Found service:', service)
            if (service.name === 'fetch-api' || service.name.includes('fetch-api')) {
                foundService = service
                discoveryEvents.emit('serviceFound', service)
            }
        })

        zeroconf.on('error', (err: any) => {
            console.error('[Discovery] Error:', err)
        })
    } catch (e) {
        console.error('[Discovery] Failed to instantiate Zeroconf:', e)
        // Fallback to mock if instantiation fails despite check
        zeroconf = null
    }
}

if (!zeroconf) {
    console.warn('[Discovery] ZeroConf not supported (likely running in Expo Go). Mocking.')
    zeroconf = {
        scan: () => console.log('[Discovery Mock] Scan started'),
        stop: () => console.log('[Discovery Mock] Scan stopped'),
        on: () => { },
        removeListener: () => { },
    }
}

export const startDiscovery = () => {
    // Scan for _fetch-api._tcp.local.
    // The library expects the type without underscores and protocol.
    // Usually 'http' or custom.
    // If Python broadcasts "_fetch-api._tcp.local", we scan for type "fetch-api" protocol "tcp".
    zeroconf.scan('fetch-api', 'tcp', 'local.')
}

export const stopDiscovery = () => {
    zeroconf.stop()
}

export const getService = () => foundService

export const getServiceUrl = () => {
    if (!foundService) return null
    // Prefer IPv4
    const ip = foundService.addresses && foundService.addresses.length > 0 ? foundService.addresses[0] : foundService.host
    const port = foundService.port
    return `http://${ip}:${port}`
}

export const onServiceFound = (callback: (service: any) => void) => {
    discoveryEvents.on('serviceFound', callback)
    if (foundService) {
        callback(foundService)
    }
    return () => discoveryEvents.off('serviceFound', callback)
}
