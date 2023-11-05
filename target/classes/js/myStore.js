app.controller(
  "MyStoreController",
  function ($scope, $http, $routeParams, $rootScope, $timeout, $window) {
    var url = "http://localhost:8080";
    var token = "ad138b51-6784-11ee-a59f-a260851ba65c";
    $scope.listProductMyStore = [];
    $scope.listProductPending = [];
    $scope.listProvince = [];
    $scope.listDistrict = [];
    $scope.listWard = [];
    $scope.totalPages = 0;
    $scope.totalPagePending = 0;

    //Biến check xem có phải cửa hàng của mình không
    $scope.userId = $routeParams.userId;
    //Biến lưu trạng thái lọc
    $scope.filterStatus = "Tất cả";

    // Hàm để thay đổi trạng thái lọc
    $scope.changeFilterStatus = function (status) {
      $scope.filterStatus = status;
    };

    $scope.customFilter = function (filter) {
      if ($scope.filterStatus === "Tất cả") {
        return true; // Hiển thị tất cả
      } else if (
        $scope.filterStatus === "Giá  dưới 200.000₫" &&
        filter.originalPrice <= 200000
      ) {
        return true; // Hiển thị đánh giá tích cực
      } else if (
        $scope.filterStatus === "Giá từ 200.000₫ đến 500.000₫" &&
        filter.originalPrice > 200000 &&
        filter.originalPrice <= 500000
      ) {
        return true; // Hiển thị đánh giá tích cực
      } else if (
        $scope.filterStatus === "Giá từ 500.000₫ đến 1.000.000₫" &&
        filter.originalPrice > 500000 &&
        filter.originalPrice <= 1000000
      ) {
        return true; // Hiển thị đánh giá tích cực
      } else if (
        $scope.filterStatus === "Trên 1.000.000₫" &&
        filter.originalPrice > 1000000
      ) {
        return true; // Hiển thị đánh giá tích cực
      }
      return false; // Ẩn các sản phẩm không phù hợp với bất kỳ điều kiện nào
    };

    //Load sản phẩm theo số trang
    $scope.page = function (currentPageMyStore) {
      $http
        .get(url + "/mystore/" + $routeParams.userId + "/" + currentPageMyStore)
        .then(function (res) {
          originalList = res.data.content;
          $scope.listProductMyStore = res.data.content; // Lưu danh sách sản phẩm từ phản hồi
          $scope.totalPages = res.data.totalPages; // Lấy tổng số trang từ phản hồi
        })
        .catch(function (error) {
          console.log(error);
        });
        $rootScope.checkMystore = 1;
    };

    $scope.pagePending = function (currentPagePending) {
      $http
        .get(
          url +
          "/mystore-pending/" +
          $routeParams.userId +
          "/" +
          currentPagePending
        )
        .then(function (res) {
          $scope.listProductPending = res.data.content; // Lưu danh sách sản phẩm từ phản hồi
          $scope.totalPagePending = res.data.totalPages; // Lấy tổng số trang từ phản hồi
          
        })
        .catch(function (error) {
          console.log(error);
        });
        $rootScope.checkMystore = 2;
    };

    //Tìm kiếm
    $scope.searchProduct = function () {
      var search = $scope.searchValue;
      console.log(search)
      if ($scope.searchValue === "") {
        $scope.listProductMyStore = originalList;
        return;
      } else {
        $http
          .get(
            url + "/searchProductMyStore/" + $routeParams.userId + "/" + search
          )
          .then(function (response) {
            $scope.listProductMyStore = response.data.content;
            $scope.totalPages = response.data.totalPages;
          });
      }
    };

    //Xóa sản phẩm
    $scope.hideProductMyStore = function (productId) {
      Swal.fire({
        text: "Bạn có chắn muốn xóa sản phẩm này không?",
        icon: "warning",
        confirmButtonText: "Có, chắc chắn",
        showCancelButton: true,
        confirmButtonColor: "#159b59",
        cancelButtonColor: "#d33",
      }).then((result) => {
        if (result.isConfirmed) {
          $http
            .post(
              url +
              "/hideProductMyStore/" +
              $routeParams.userId +
              "/" +
              productId +
              "/" +
              $rootScope.currentPageMyStore
            )
            .then(function (response) {
              $scope.listProductMyStore = response.data.content;
              $scope.totalPages = response.data.totalPages;
            });
        }
      });
    };

    //Phân trang đang bán
    $scope.Previous = function () {
      if ($rootScope.currentPageMyStore === 0) {
        return;
      } else {
        $rootScope.currentPageMyStore = $rootScope.currentPageMyStore - 1; // Cập nhật trang hiện tại
        $scope.page($rootScope.currentPageMyStore);
      }
    };

    $scope.Next = function () {
      if ($rootScope.currentPageMyStore === $scope.totalPages - 1) {
        return;
      } else {
        $rootScope.currentPageMyStore = $rootScope.currentPageMyStore + 1; // Cập nhật trang hiện tại

        $scope.page($rootScope.currentPageMyStore);
      }
    };

    //Phân trang của tabs chờ duyệt
    $scope.PreviousPending = function () {
      if ($rootScope.currentPagePending === 0) {
        return;
      } else {
        $rootScope.currentPagePending = $rootScope.currentPagePending - 1; // Cập nhật trang hiện tại
        $scope.pagePending($rootScope.currentPagePending);
      }
    };

    $scope.NextPending = function () {
      if ($rootScope.currentPagePending === $scope.totalPagePending - 1) {
        return;
      } else {
        $rootScope.currentPagePending = $rootScope.currentPagePending + 1; // Cập nhật trang hiện tại

        $scope.pagePending($rootScope.currentPagePending);
      }
    };

    //tính lượt đánh giá trung bình
    $scope.calculateAverageRating = function (ratings) {
      if (ratings.length === 0) {
        return 0;
      } else {
        //tính tổng số lượng các đánh giá
        var totalRatings = ratings.reduce(function (sum, rating) {
          return sum + parseFloat(rating.ratingValue);
        }, 0);

        var averageRating = totalRatings / ratings.length;
        return averageRating.toFixed(1);
      }
    };

    //tính giá khuyến mãi
    $scope.getSalePrice = function (originalPrice, promotion) {
      if (promotion === 0) {
        return originalPrice;
      } else {
        //tính tổng số lượng các đánh giá
        var SalePrice = originalPrice - (originalPrice * promotion) / 100;
        return SalePrice;
      }
    };

    $scope.getProduct = function (productId) {
      $http
        .get(url + "/get-product/" + productId)
        .then(function (res) {
          $scope.color = "";
          $scope.product = res.data;
          $scope.total = -1;
          $scope.quantity = 1;
        })
        .catch(function (error) {
          console.log(error);
        });
    };

    //Lấy danh sách Tỉnh thành phố
    $scope.showProvince = function () {
      $http({
        method: "POST",
        url: "https://online-gateway.ghn.vn/shiip/public-api/master-data/province",
        headers: {
          Token: token,
        },
      })
        .then(function (response) {
          // Xử lý phản hồi thành công
          $scope.listProvince = response.data.data;
        })
        .catch(function (error) {
          // Xử lý lỗi
          console.error("API request failed:", error);
          // In ra nội dung đối tượng lỗi
          console.log("Error Object:", error);
        });
    };

    //Lấy danh sách Quận huyện
    $scope.onProvince = function () {
      $http({
        method: "POST",
        url: "https://online-gateway.ghn.vn/shiip/public-api/master-data/district",
        headers: {
          Token: token,
        },
        data: {
          province_id: $scope.selectedProvince.ProvinceID,
        },
      })
        .then(function (response) {
          // Xử lý phản hồi thành công
          $scope.listDistrict = response.data.data;
        })
        .catch(function (error) {
          // Xử lý lỗi
          console.error("API request failed:", error);
          // In ra nội dung đối tượng lỗi
          console.log("Error Object:", error);
        });
    };

    //Lấy danh sách Phường xã
    $scope.onDistrict = function () {
      $http({
        method: "POST",
        url: "https://online-gateway.ghn.vn/shiip/public-api/master-data/ward",
        headers: {
          Token: token,
        },
        data: {
          district_id: $scope.selectedDistrict.DistrictID,
        },
      })
        .then(function (response) {
          // Xử lý phản hồi thành công
          $scope.listWard = response.data.data;
        })
        .catch(function (error) {
          // Xử lý lỗi
          console.error("API request failed:", error);
          // In ra nội dung đối tượng lỗi
          console.log("Error Object:", error);
        });
    };

    //Thêm địa chỉ
    $scope.addAddress = function (phoneNumber) {
      var inputElement = document.getElementById("phone");
      // Lấy giá trị từ input
      var inputValue = inputElement.value;

      if (
        $scope.selectedDistrict == null ||
        $scope.selectedProvince == null ||
        $scope.selectedWard == null ||
        inputValue == "" ||
        $scope.textareaValue == null
      ) {
        Swal.fire({
          position: "top",
          icon: "warning",
          text: "Chưa đủ thông tin địa chỉ!",
          showConfirmButton: false,
          timer: 1800,
        });
      } else {
        //Thêm địa chỉ
        var content = "";
        var formData = new FormData();
        formData.append("districtID", $scope.selectedDistrict.DistrictID);
        formData.append("districtName", $scope.selectedDistrict.DistrictName);
        formData.append("provinceID", $scope.selectedProvince.ProvinceID);
        formData.append("provinceName", $scope.selectedProvince.ProvinceName);
        formData.append("wardCode", $scope.selectedWard.WardCode);
        formData.append("wardName", $scope.selectedWard.WardName);
        formData.append("deliveryPhone", inputValue);
        formData.append("addressStore", true);
        if ($scope.textareaValue != null) {
          content = $scope.textareaValue;
        }
        formData.append("detailAddress", content);

        $http
          .post(url + "/add-to-DeliveryAddress", formData, {
            transformRequest: angular.identity,
            headers: { "Content-Type": undefined },
          })
          .then(function (response) { });

        $http
          .put(url + "/admin/usermanager/userRole/" + phoneNumber + "/" + 4)
          .then(function (response) {
            Swal.fire({
              position: "top",
              icon: "success",
              text: "Đăng ký thành công",
              showConfirmButton: false,
              timer: 1000,
            });
            $scope.reloadPageAfterDelay(1)
          })
          .catch(function (error) {
            // Xử lý lỗi
            console.log(error);
          });
      }
    };

    $scope.reloadPageAfterDelay = function (delayInSeconds) {
      $timeout(function () {
        $window.location.reload();
      }, delayInSeconds * 1000); // Chuyển đổi giây thành mili giây
    };

    //Viết tất cả code thống kê trong đây, đừng viết ngoài hàm này. Viết ngoài hàm này bị lỗi MyStore thì chịu trách nhiệm nhá :))
    $scope.tabsReport = function(){
    $rootScope.checkMystore = 3;
    //thống kê của hàng của tôi 
    $scope.countorderperonal = [];
    $scope.sumorderperonal = [];
    $scope.Orderstatus = [];
    $scope.bestselling = [];
    var Url = "http://localhost:8080/personalStatisticsCoutOrder";
    var Url2 = "http://localhost:8080/personalStatisticsSumTotalAmout";
    var Url3 = "http://localhost:8080/personalStatisticsCoutOrderStatus";
    var Url4 = "http://localhost:8080/productbestSelling";
    var categories2 = [];
    var data2 = [];

    //biểu đồ 1 
    $http.get(Url2).then(function (response) {
      $scope.sumorderperonal = response.data;
      console.log("Load dữ liệu1" + $scope.sumorderperonal);
      $scope.sumorderperonal.forEach(function (item) {
        categories2.push("Tháng " + (item[0])); // Cộng thêm 1 vào giá trị tháng
        data2.push(parseInt(item[1]));
      });

      console.log("Data2: " + JSON.stringify(data2));
      Highcharts.chart('container', option);

    }).catch(function (error) {
      console.error("Lỗi: " + error);
    });
    var categories = [];
    var data = [];
    // Highcharts.setOptions({
    //   lang: {
    //     thousandsSep: ','
    //   }
    // });
    var option = {
      chart: {
        zoomType: 'xy'
      },
      title: {
        text: '',
        align: 'left'
      },
      subtitle: {

        align: 'left'
      },
      xAxis: {
        categories: categories,
      },
      yAxis: [{ // Primary yAxis
        labels: {
          format: '{value:.0f}',
          style: {
            color: Highcharts.getOptions().colors[1]
          }
        },
        title: {
          text: 'Tổng số lượng đơn hàng',
          style: {
            color: Highcharts.getOptions().colors[1]
          }
        }
      }, { // Secondary yAxis
        title: {
          text: 'Doanh thu',
          style: {
            color: Highcharts.getOptions().colors[0]
          }
        },
        labels: {
          formatter: function () {
            return Highcharts.numberFormat(this.value, 0, '', '.') + ' VND';
          },
          style: {
            color: Highcharts.getOptions().colors[0]
          }
        },
        opposite: true
      }],
      tooltip: {
        shared: true
      },
      legend: {
        align: 'left',
        x: 80,
        verticalAlign: 'top',
        y: 60,
        floating: false,
        backgroundColor:
          Highcharts.defaultOptions.legend.backgroundColor || // theme
          'rgba(255,255,255,0.25)'
      },
      series: [{
        name: 'Doanh thu',
        type: 'column',
        yAxis: 1,
        data: data2,
        tooltip: {
          valueSuffix: ' VND'
        }

      }, {
        name: 'Tổng số lượng đơn hàng',
        type: 'spline',
        data: data,
        tooltip: {
          valueSuffix: ' đơn hàng'
        }
      }]
    }
    $http.get(Url)
      .then(function (response) {
        $scope.countorderperonal = response.data;
        console.log("Load dữ liệu" + $scope.countorderperonal);
        // Tạo mảng categories và data từ dữ liệu
        $scope.countorderperonal.forEach(function (item) {
          categories.push("Tháng " + (item[0])); // Cộng thêm 1 vào giá trị tháng
          data.push(parseInt(item[1]));
        });
        console.log("Data: " + JSON.stringify(data));
        Highcharts.chart('container', option);
      })
      .catch(function (error) {
        console.error("Lỗi: " + error);
      });




    //biểu đò 2 
    var nameOrderStatus = [];
    var data3 = [];
    $http.get(Url3).then(function (response) {
      $scope.Orderstatus = response.data;
      console.log("Load dữ liệu3" + $scope.Orderstatus);
      $scope.Orderstatus.forEach(function (item) {
        nameOrderStatus.push((item[0]));
        data3.push((item[1]));
      });
      console.log("Data3: " + JSON.stringify(data3));
      // Highcharts.chart('container', option);
      var names = nameOrderStatus;
      var values = data3;

      // Tạo mảng dữ liệu từ hai mảng riêng biệt
      var dataOrderstatus = names.map(function (name, index) {
        return {
          name: name,
          y: values[index]
        };
      });
      // Build the chart
      Highcharts.chart('container1', {
        chart: {
          plotBackgroundColor: null,
          plotBorderWidth: null,
          plotShadow: false,
          type: 'pie'
        },
        title: {
          text: '',
          align: 'left'
        },
        tooltip: {
          // pointFormat: '{series.name}: <b>{point.percentage:.0f} đơn</b>'
        },
        accessibility: {
          point: {
            valueSuffix: ' đơn'
          }
        },
        plotOptions: {
          pie: {
            allowPointSelect: true,
            cursor: 'pointer',
            dataLabels: {
              enabled: true,
              format: '<br>{point.percentage:.0f} %',
              distance: -50,
              filter: {
                property: 'percentage',
                operator: '>',
                value: 4
              }
            },
            showInLegend: true
          }
        },
        series: [{
          name: 'Đơn hàng',
          colorByPoint: true,
          data: dataOrderstatus
        }]
      });
    }).catch(function (error) {
      console.error("Lỗi: " + error);
    });

    //bestselling Product
    $http.get(Url4).then(function (response) {
      $scope.bestselling = response.data;
      console.log("bestselling" + $scope.bestselling);
    }).catch(function (error) {
      console.error("Lỗi: " + error);
    });
    }


    //Load từ đầu
    if($rootScope.checkMystore === 1){
      $scope.page($rootScope.currentPageMyStore);
    }else if($rootScope.checkMystore === 2){
      $scope.pagePending($rootScope.currentPagePending)
    }else if($rootScope.checkMystore === 3){
      $scope.tabsReport();
    }
  });

