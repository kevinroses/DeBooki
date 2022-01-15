import React, { useEffect, useState } from "react";
import { eBook } from "../../controllers/eBookMarketLaunch";
import PreviewBookCoverPage from "../common/PreviewBookCoverPage";
import LoadingCircle from "../common/LoadingCircle";
import { useRouter } from "next/router";
import { putBookForRent } from "../../controllers/eBookRenter";
import { useSignerContext } from "../../context/Signer";
import { useLoadingContext } from "../../context/Loading";
interface Props {
  bookMetadataURI: string;
  status: number;
}

const BookOwnedInShelfCard = ({ bookMetadataURI, status }: Props) => {
  const router = useRouter();
  const { signer } = useSignerContext();
  const { setLoading } = useLoadingContext();
  const [bookMetadata, setBookMetadata] = useState<eBook | undefined>();
  useEffect(() => {
    const fetchMetadata = async () => {
      const response = await fetch(bookMetadataURI);
      const json = await response.json();
      return json;
    };
    fetchMetadata().then((_metadata) => {
      setBookMetadata(_metadata);
    });
  }, []);
  return bookMetadata ? (
    <div className="group h-80 w-full border border-gray-300 flex flex-row space-x-5 pr-5 overflow-hidden bg-white rounded-lg">
      <div className="flex-1 h-full w-full shadow-lg">
        <PreviewBookCoverPage
          src={bookMetadata.ebook_cover_image}
          height={320}
        />
      </div>
      <div className="flex-1 h-full w-full flex flex-col justify-center items-center py-5">
        <p className="text-sm text-justify">
          {bookMetadata.description.slice(0, 311)}...
        </p>
        <div className="flex flex-col w-full h-full justify-end">
          {status != 4 && (
            <div className="flex justify-end pb-10">
              <button
                className="text-sm text-primary self-end"
                onClick={() => {
                  router.push(
                    {
                      pathname: `/bookReader`,
                      query: {
                        bookID: bookMetadata.book_id,
                      },
                    },
                    `/dashboard/reader`
                  );
                }}
              >
                Read &#10142;
              </button>
            </div>
          )}
          {status == 0 ? (
            <div className="flex justify-between">
              <button
                className={`text-sm font-semibold text-red-500`}
                onClick={() => {
                  router.push(
                    {
                      pathname: `/dashboard/exchange`,
                      query: {
                        selected: 3,
                        buyState: false,
                        data: JSON.stringify(bookMetadata),
                      },
                    },
                    `/dashboard/exchange`
                  );
                  setLoading(true)
                }}
              >
                {`Place Sell Order`}
              </button>
              <button
                className="text-sm text-red-500 font-semibold"
                onClick={() => {
                  putBookForRent(signer.signer, bookMetadata.book_id).then(
                    () => {
                      router.reload();
                    }
                  );
                }}
              >
                Put On Rent
              </button>
            </div>
          ) : (
            <p className="text-red-300">
              {status == 1 ? "On Sale" : "On Rent"}
            </p>
          )}
        </div>
      </div>
    </div>
  ) : (
    <div className="flex justify-center items-center">
      <LoadingCircle />
    </div>
  );
};

export default BookOwnedInShelfCard;
