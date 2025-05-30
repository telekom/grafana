// SPDX-License-Identifier: AGPL-3.0-only

// Code generated by client-gen. DO NOT EDIT.

package fake

import (
	v0alpha1 "github.com/grafana/grafana/pkg/aggregator/apis/aggregation/v0alpha1"
	aggregationv0alpha1 "github.com/grafana/grafana/pkg/aggregator/generated/applyconfiguration/aggregation/v0alpha1"
	typedaggregationv0alpha1 "github.com/grafana/grafana/pkg/aggregator/generated/clientset/versioned/typed/aggregation/v0alpha1"
	gentype "k8s.io/client-go/gentype"
)

// fakeDataPlaneServices implements DataPlaneServiceInterface
type fakeDataPlaneServices struct {
	*gentype.FakeClientWithListAndApply[*v0alpha1.DataPlaneService, *v0alpha1.DataPlaneServiceList, *aggregationv0alpha1.DataPlaneServiceApplyConfiguration]
	Fake *FakeAggregationV0alpha1
}

func newFakeDataPlaneServices(fake *FakeAggregationV0alpha1) typedaggregationv0alpha1.DataPlaneServiceInterface {
	return &fakeDataPlaneServices{
		gentype.NewFakeClientWithListAndApply[*v0alpha1.DataPlaneService, *v0alpha1.DataPlaneServiceList, *aggregationv0alpha1.DataPlaneServiceApplyConfiguration](
			fake.Fake,
			"",
			v0alpha1.SchemeGroupVersion.WithResource("dataplaneservices"),
			v0alpha1.SchemeGroupVersion.WithKind("DataPlaneService"),
			func() *v0alpha1.DataPlaneService { return &v0alpha1.DataPlaneService{} },
			func() *v0alpha1.DataPlaneServiceList { return &v0alpha1.DataPlaneServiceList{} },
			func(dst, src *v0alpha1.DataPlaneServiceList) { dst.ListMeta = src.ListMeta },
			func(list *v0alpha1.DataPlaneServiceList) []*v0alpha1.DataPlaneService {
				return gentype.ToPointerSlice(list.Items)
			},
			func(list *v0alpha1.DataPlaneServiceList, items []*v0alpha1.DataPlaneService) {
				list.Items = gentype.FromPointerSlice(items)
			},
		),
		fake,
	}
}
