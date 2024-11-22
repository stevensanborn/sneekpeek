'use client'

import { ContentStatusEnum } from '@/app/articles/[article]/page';
import Time from '../ui/time';
import { useEffect, useState, useRef } from 'react';

export default function ContentStatus({
  articleInfo,
  contentUserState,
  contentStatus,
  triggerCheckAccess,
}: {
  articleInfo: any;
  contentUserState: any;
  contentStatus: ContentStatusEnum;
  triggerCheckAccess: Function;
}) {
  const [timeNow, setTimeNow] = useState(Date.now());
  let interval: any;

  const formatTime = (secs: number) => {
    let time = '';
    const hours = Math.floor(secs / 3600);
    if (hours > 0) time += `${hours}:`;
    const minutes = Math.floor((secs % 3600) / 60);
    if (minutes > 0) time += `${minutes.toString().padStart(2, '0')}:`;
    const seconds = Math.round(secs % 60)
      .toString()
      .padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };
  useEffect(() => {
    setTimeNow(Date.now());
    interval = setInterval(() => {
      setTimeNow(Date.now());
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  }, []);
  const refTimerCircle = useRef<SVGCircleElement>(null);
  useEffect(() => {
    if (!articleInfo || !contentUserState) return;
    if (refTimerCircle.current) {
      let ratio =
        (timeNow / 1000 - contentUserState.time.toNumber()) /
        articleInfo.duration.toNumber();
    //   console.log(ratio);
      var color2 = 'FF0000';
      var color1 = '00FF9F';

      var hex = function (x: number) {
        let strx = x.toString(16);
        return strx.length == 1 ? '0' + strx : strx;
      };
      var getIntColor = function (color: string, i1: number, i2: number) {
        return parseInt(color.substring(i1, i2), 16);
      };
      var getColorRatio = function (
        c1: string,
        c2: string,
        ratio: number,
        i1: number,
        i2: number
      ) {
        let color1 = getIntColor(c1, i1, i2);
        let color2 = getIntColor(c2, i1, i2);

        return Math.ceil(color1 + (color2 - color1) * ratio);
      };
      var r = getColorRatio(color1, color2, ratio, 0, 2);
      var g = getColorRatio(color1, color2, ratio, 2, 4);
      var b = getColorRatio(color1, color2, ratio, 4, 6);
    //   console.log(r, g, b);
      var middle = hex(r) + hex(g) + hex(b);

      refTimerCircle.current.style.strokeDashoffset = (
        (360 * (timeNow / 1000 - contentUserState.time.toNumber())) /
        articleInfo.duration.toNumber()
      ).toString();
      refTimerCircle.current.style.stroke = `#${middle}`;

      //check if time is up
      if (
        timeNow / 1000 >
        contentUserState.time.toNumber() + articleInfo.duration.toNumber()
      ) {
        triggerCheckAccess();
      }
    }
  }, [timeNow]);
  return (
    <div className='flex-row flex items-center my-4 bg-gray-100 rounded-lg p-4'>

        
      {/* Access Status {contentStatus} */}
      {articleInfo && (
        <>
          {/* <div>Cost: {articleInfo?.cost.toString()}</div>
          <div>
            Duration: <Time seconds={articleInfo?.duration.toNumber() ?? 0} />
          </div> */}
          {contentUserState && (
            <>
            
              
              { contentStatus === ContentStatusEnum.ACCESSIBLE && (
              <div className="flex justify-center items-center relative">
                <div className="flex justify-center  items-center relative jus ">
                  <span className="text-sm absolute">

                   {formatTime(
                      contentUserState.time.toNumber() +
                        articleInfo.duration.toNumber() -
                        timeNow / 1000
                    )}
                  </span>

                  <svg
                    version="1.1"
                    id="circle"
                    xmlns="http://www.w3.org/2000/svg"
                    x="0px"
                    y="0px"
                    viewBox="0 0 100 100"
                    height="70"
                    width="70"
                  >
                    <circle
                      fill="none"
                      stroke="white"
                      stroke-width="5"
                      stroke-mitterlimit="0"
                      cx="50"
                      cy="50"
                      r="48"
                      stroke-dasharray="360"
                      stroke-linecap="round"
                      transform="rotate(-90 ) translate(-100 0)"
                    ></circle>
                    <circle
                      ref={refTimerCircle}
                      fill="none"
                      stroke="blue"
                      stroke-width="5"
                      stroke-mitterlimit="0"
                      cx="50"
                      cy="50"
                      r="48"
                      stroke-dasharray="360"
                      stroke-linecap="round"
                      transform="rotate(-90 ) translate(-100 0)"
                    ></circle>
                  </svg>
                </div>
                
              </div>
              )}
                <div className='mx-4'>
                    <p>This content is available for a total of {articleInfo.duration.toNumber()} seconds </p>
                Initial Access Time was {' '}
                {new Date(
                  contentUserState.time.toNumber() * 1000
                ).toLocaleString()}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
