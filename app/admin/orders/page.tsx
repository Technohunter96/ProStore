import { requireAdmin } from '@/lib/auth-guard';
import { deleteOrder, getAllOrders } from '@/lib/actions/order.actions';
import { Metadata } from 'next';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatCurrency, formatDateTime, formatId } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Pagination from '@/components/shared/pagination';
import DeleteDialog from '@/components/shared/delete-dialog';

export const metadata: Metadata = {
  title: 'Admin Orders',
};

const AdminOrders = async (props: { searchParams: Promise<{ page: string }> }) => {
  await requireAdmin();

  const { page } = await props.searchParams;

  const orders = await getAllOrders({
    page: Number(page) || 1,
    // limit: 4,
  });

  return (
    <div className='space-y-2'>
      <div className='h2-bold'>Orders</div>
      <div className='overflow-x-auto'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>DATE</TableHead>
              <TableHead>TOTAL</TableHead>
              <TableHead>PAID</TableHead>
              <TableHead>DELIVERED</TableHead>
              <TableHead>ACTIONS</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.data.map((order) => (
              <TableRow key={order.id}>
                <TableCell>{formatId(order.id)}</TableCell>
                <TableCell>{formatDateTime(order.createdAt).dateTime}</TableCell>
                <TableCell>{formatCurrency(order.totalPrice)}</TableCell>
                <TableCell>
                  {order.isPaid && order.paidAt ? (
                    <Badge variant='success'>{formatDateTime(order.paidAt).dateTime}</Badge>
                  ) : (
                    <Badge variant='warning'>Not Paid</Badge>
                  )}
                </TableCell>
                <TableCell>
                  {order.isDelivered && order.deliveredAt ? (
                    formatDateTime(order.deliveredAt).dateTime
                  ) : (
                    <Badge variant='outline'>Not Delivered</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <Button asChild variant='outline'>
                    <Link href={`/order/${order.id}`}>Details</Link>
                  </Button>
                  <DeleteDialog id={order.id} action={deleteOrder} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {orders.totalPages > 1 && (
          <Pagination page={Number(page) || 1} totalPages={orders?.totalPages} />
        )}
      </div>
    </div>
  );
};

export default AdminOrders;
