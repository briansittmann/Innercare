'use client'

import { makePage } from '@keystatic/next/ui/app'
import config from '@/keystatic.config'

// makePage no lleva 'use client' propio: lo tiene que llevar quien lo llama.
export default makePage(config)
