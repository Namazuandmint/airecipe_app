export type IconName =
  | 'spark'
  | 'basket'
  | 'camera'
  | 'list'
  | 'clock'
  | 'heart'
  | 'settings'
  | 'bell'
  | 'user'
  | 'message'
  | 'plus'
  | 'arrow'

export type FeatureTone =
  | 'green'
  | 'red'
  | 'yellow'
  | 'blue'
  | 'violet'
  | 'slate'

export type Feature = {
  title: string
  description: string
  action: string
  icon: IconName
  tone: FeatureTone
}

export type Ingredient = {
  name: string
  amount: string
  status: string
}

export type Recipe = {
  name: string
  meta: string
  tags: string[]
}
