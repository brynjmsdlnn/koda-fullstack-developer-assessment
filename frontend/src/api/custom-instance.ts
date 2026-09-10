import axios from 'axios'
import type { AxiosRequestConfig, AxiosResponse } from 'axios'

export const AXIOS_INSTANCE = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

export const customInstance = <T>(
  config: AxiosRequestConfig,
  options?: AxiosRequestConfig,
): Promise<T> => {
  const source = axios.CancelToken.source()
  const promise = AXIOS_INSTANCE({
    ...config,
    ...options,
    cancelToken: source.token,
  }).then(({ data }: AxiosResponse<T>) => data)

  // @ts-expect-error cancel token support
  promise.cancel = () => {
    source.cancel('Query was cancelled')
  }

  return promise
}

export type ErrorType<TError> = TError

export type BodyType<TBodyData> = TBodyData

export default customInstance
