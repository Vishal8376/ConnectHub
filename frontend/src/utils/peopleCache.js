const cache = new Map()

export function rememberPerson(person) {
  if (!person) return
  const id = person.id ?? person.userId
  if (id == null) return
  const existing = cache.get(Number(id)) || {}
  cache.set(Number(id), {
    ...existing,
    ...person,
    id: Number(id),
  })
}

export function rememberPeople(list = []) {
  list.forEach(rememberPerson)
}

export function getCachedPerson(id) {
  return cache.get(Number(id)) || null
}
