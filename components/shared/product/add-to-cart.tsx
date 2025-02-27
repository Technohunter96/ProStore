'use client';

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Plus, Minus, Loader } from 'lucide-react';
// import { Toast } from '@/components/ui/toast';
import { Cart, CartItem } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { ToastAction } from '@/components/ui/toast';
import { addItemToCart, removeItemFromCart } from '@/lib/actions/cart.actions';
import { useTransition } from 'react';

const AddToCart = ({ cart, item }: { cart?: Cart; item: CartItem }) => {
  const router = useRouter();
  const { toast } = useToast();

  const [isPending, startTransition] = useTransition();

  // HandleAddToCart
  const handleAddToCart = async () => {
    startTransition(async () => {
      const res = await addItemToCart(item);

      if (!res.success) {
        toast({
          variant: 'destructive',
          description: res.message,
        });
        return;
      }

      // Handle success add to cart
      toast({
        description: res.message,
        action: (
          <ToastAction
            className='bg-primary text-white hover:bg-gray-800 dark:hover:bg-slate-200 dark:bg-white dark:text-gray-800'
            altText='Go To Cart'
            onClick={() => router.push('/cart')}
          >
            Go To Cart
          </ToastAction>
        ),
      });
    });
  };

  // HandleRemoveFromCart
  const handleRemoveFromCart = async () => {
    startTransition(async () => {
      const res = await removeItemFromCart(item.productId);

      toast({
        variant: res.success ? 'default' : 'destructive',
        description: res.message,
      });

      return;
    });
  };

  // Check if item is in cart
  const existItem = cart && cart.items.find((x) => x.productId === item.productId);

  return existItem ? (
    <>
      <Button type='button' variant='outline' onClick={handleRemoveFromCart} disabled={isPending}>
        {isPending ? <Loader className='h-4 w-4 animate-spin' /> : <Minus className='h-4 w-4' />}
      </Button>
      <span className='px-2'>{existItem.qty}</span>
      <Button type='button' variant='outline' onClick={handleAddToCart} disabled={isPending}>
        {isPending ? <Loader className='h-4 w-4 animate-spin' /> : <Plus className='h-4 w-4' />}
      </Button>
    </>
  ) : (
    <Button className='w-full' type='button' onClick={handleAddToCart} disabled={isPending}>
      {isPending ? <Loader className='h-4 w-4 animate-spin' /> : <Plus className='h-4 w-4' />} Add
      To Cart
    </Button>
  );
};

export default AddToCart;
