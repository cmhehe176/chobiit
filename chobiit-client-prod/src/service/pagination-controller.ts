export default class PaginationController {
    static moveToNextPage(): void {
      const nextButton: HTMLElement | null = document.querySelector(".fc-next-button");
      if (nextButton) {
        nextButton.click();
      }
    }
  
    static moveToPrevPage(): void {
      const prevButton: HTMLElement | null = document.querySelector(".fc-prev-button");
      if (prevButton) {
        prevButton.click();
      }
    }
  }