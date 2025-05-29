import { Port } from '@custom-express/better-standard-library'

import { router } from '../../../dummmies/app'

router.start(new Port(4000))
