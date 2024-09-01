'use client';
import React from 'react';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from './ui/pagination';
import { cn } from '@repo/shared/lib/utils';
import clamp from 'lodash/clamp';
import inRange from 'lodash/inRange';
import range from 'lodash/range';
import { usePathname } from 'next/navigation';

export type BakaPaginationType = {
  page: number;
  pageSize: number;
  totalRecords: number;
  nbPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
};

type BakaPaginationProps = BakaPaginationType & {
  className?: string;
};

const MAX_ITEMS = 5;

/**
 * Generates an array of page numbers based on the current page and the last page.
 * @param {number} currentPage - The current page number.
 * @param {number} lastPage - The last page number.
 * @returns {number[]} An array of page numbers. May contain Infinity for gaps between non-adjacent pages.
 */
function generatePagesArray(currentPage: number, lastPage: number) {
  const pagesArr: number[] = [];

  // The first page needs to always exist.
  pagesArr.push(1);

  // The pages in between 1 and lastPage.
  let start = clamp(Math.ceil(currentPage - MAX_ITEMS / 2), 2, lastPage),
    end = clamp(start + MAX_ITEMS, start + 1, lastPage);

  const dStartEnd = MAX_ITEMS - (end - start);

  if (inRange(start, 1, lastPage) && inRange(end, 1, lastPage + 1)) {
    for (let i = 0; i < dStartEnd; i++) {
      // Attempt to fill the remaining pages to fulfill maxItems
      const distFirstAndStart = start - 2,
        distEndAndLast = end - lastPage;

      if (distFirstAndStart && distFirstAndStart > distEndAndLast) {
        // There is more space at lower areas, expand it.
        start--;
      } else if (distEndAndLast && distEndAndLast > distFirstAndStart) {
        // There is more space at higher areas, expand it.
        end++;
      } else if (distEndAndLast === distFirstAndStart) {
        // There is equal space between lower and higher areas,
        // Ensure there's space and expand any of them with order from lower then higher.
        if (distFirstAndStart) {
          start--;
        } else if (distEndAndLast) {
          end++;
        }
      }
    }

    pagesArr.push(...range(start, end, 1));
  }

  // The last page also needs to exist.
  if (lastPage > 1) {
    pagesArr.push(lastPage);
  }

  // Insert Infinity (ellipsis) between first and second
  if (pagesArr[1] - pagesArr[0] > 1) {
    pagesArr.splice(1, 0, Infinity);
  }

  // Insert Infinity (ellipsis) between last and second to last.
  if (pagesArr[pagesArr.length - 1] - pagesArr[pagesArr.length - 2] > 1) {
    pagesArr.splice(pagesArr.length - 1, 0, Infinity);
  }

  return pagesArr;
}

export const BakaPagination: React.FC<BakaPaginationProps> = (props) => {
  const { className, page, pageSize, totalRecords, nbPages, hasNext, hasPrevious } = props;
  const pathname = usePathname();

  const lastPage = Math.ceil(totalRecords / pageSize),
    currentPage = clamp(page, 1, lastPage),
    pagesArr = generatePagesArray(currentPage, lastPage);

  return (
    <Pagination className={cn(className)} data-testid="baka-pagination">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href={{
              pathname,
              query: { page: hasPrevious ? currentPage - 1 : currentPage },
            }}
            disabled={!hasPrevious}
          />
        </PaginationItem>
        {pagesArr.map((pageIdx, idx) => {
          const isActive = currentPage === pageIdx;

          if (pageIdx === Infinity) {
            return <PaginationEllipsis key={idx} />;
          } else {
            return (
              <PaginationItem key={idx}>
                <PaginationLink
                  href={{
                    pathname,
                    query: { page: pageIdx },
                  }}
                  isActive={isActive}
                  disabled={isActive}
                >
                  {pageIdx}
                </PaginationLink>
              </PaginationItem>
            );
          }
        })}
        <PaginationItem>
          <PaginationNext
            href={{
              pathname,
              query: { page: hasNext ? currentPage + 1 : currentPage },
            }}
            disabled={!hasNext}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};
