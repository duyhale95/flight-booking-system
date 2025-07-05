import { useForm } from 'react-hook-form'
import Card from '../ui/Card'
import Input from '../ui/Input'
import Button from '../ui/Button'

const PassengerForm = ({ onSubmit, initialData = {} }) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: initialData,
  })

  return (
    <Card>
      <Card.Header>
        <h3 className="text-lg font-medium text-gray-900">Thông tin hành khách</h3>
      </Card.Header>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card.Body>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Họ"
              error={errors.lastName?.message}
              required
              {...register('lastName', {
                required: 'Vui lòng nhập họ',
              })}
            />
            <Input
              label="Tên"
              error={errors.firstName?.message}
              required
              {...register('firstName', {
                required: 'Vui lòng nhập tên',
              })}
            />
            <Input
              label="Email"
              type="email"
              error={errors.email?.message}
              required
              {...register('email', {
                required: 'Vui lòng nhập email',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Email không hợp lệ',
                },
              })}
            />
            <Input
              label="Số điện thoại"
              error={errors.phone?.message}
              required
              {...register('phone', {
                required: 'Vui lòng nhập số điện thoại',
                pattern: {
                  value: /^[0-9]{10}$/,
                  message: 'Số điện thoại không hợp lệ',
                },
              })}
            />
            <Input
              label="Địa chỉ"
              error={errors.address?.message}
              required
              {...register('address', {
                required: 'Vui lòng nhập địa chỉ',
              })}
            />
            <Input
              label="Thành phố"
              error={errors.city?.message}
              required
              {...register('city', {
                required: 'Vui lòng nhập thành phố',
              })}
            />
            <Input
              label="Quốc gia"
              error={errors.country?.message}
              required
              {...register('country', {
                required: 'Vui lòng nhập quốc gia',
              })}
            />
            <Input
              label="Mã bưu điện"
              error={errors.postalCode?.message}
              {...register('postalCode')}
            />
          </div>
        </Card.Body>
        <Card.Footer>
          <div className="flex justify-end">
            <Button
              type="submit"
              isLoading={isSubmitting}
            >
              Tiếp tục
            </Button>
          </div>
        </Card.Footer>
      </form>
    </Card>
  )
}

export default PassengerForm 