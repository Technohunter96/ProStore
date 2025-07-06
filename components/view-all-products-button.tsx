import Link from 'next/link';
import { Button } from './ui/button';

const ViewAllProductsButton = () => {
  return (
    <div className='flex justify-center items-center my-8 py-4 text-lg font-semibold'>
      <Button asChild variant='outline' className='px-8'>
        <Link href='/search'>View All Products</Link>
      </Button>
    </div>
  );
};

export default ViewAllProductsButton;
